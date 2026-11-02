import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { computed, effectScope, nextTick, reactive, ref, watch } from 'vue'

const source = readFileSync(new URL('../src/pages/accounting/ChartOfAccountsPage.vue', import.meta.url), 'utf8')
  .split('<script setup>')[1].split('</script>')[0].replace(/^import .*\r?\n/gm, '')
const account = { id: 'new', code: '1.1', name: 'Caja', account_type: 'ASSET', is_active: true }
const deferred = () => {
  let resolve, reject
  const promise = new Promise((yes, no) => { resolve = yes; reject = no })
  return { promise, resolve, reject }
}

async function setup(t, services = {}) {
  const activeCompany = ref({ id: 'A' })
  const calls = []
  let unmount
  const scope = effectScope()
  const bindings = {
    computed, reactive, ref, watch, onBeforeUnmount: fn => { unmount = fn },
    activeCompany, accountTypes: [], clearSession() {},
    useRouter: () => ({ push() {}, options: { history: { state: {} } } }),
    useRoute: () => ({ path: '/accounts' }),
    getAccounts: async id => { calls.push(['GET', id]); return [account] },
    createAccount: async (id, payload) => { calls.push(['POST', id, payload]); return account },
    updateAccount: async () => {}, ...services,
  }
  const page = scope.run(() => new Function(...Object.keys(bindings), `${source}\nreturn { accounts, visibleAccounts, search, typeFilter, statusFilter, form, formError, fieldErrors, statusMessage, listError, dialogVisible, openCreate, openEdit, submitForm, loadAccounts }`)(...Object.values(bindings)))
  t.after(() => { unmount(); scope.stop() })
  await nextTick()
  page.openCreate()
  Object.assign(page.form, { code: account.code, name: account.name, account_type: account.account_type })
  return { page, activeCompany, calls, unmount }
}

for (const filter of ['none', 'search', 'inactive', 'type']) {
  test(`creation shows the returned account with ${filter} filter`, async t => {
    const { page, calls } = await setup(t)
    if (filter === 'search') page.search.value = 'unrelated'
    if (filter === 'inactive') page.statusFilter.value = 'inactive'
    if (filter === 'type') page.typeFilter.value = 'LIABILITY'
    await page.submitForm()
    assert.deepEqual(page.visibleAccounts.value.map(a => a.id), ['new'])
    assert.equal(page.dialogVisible.value, false)
    assert.equal(page.statusMessage.value, 'Cuenta creada correctamente.')
    await page.loadAccounts()
    assert.deepEqual(page.visibleAccounts.value.map(a => a.id), ['new'])
    assert.equal(calls.filter(([method]) => method === 'POST').length, 1)
  })
}

test('GET failure after creation reports success and retry only queries', async t => {
  let fail = false
  let posts = 0
  const second = await setup(t, {
    getAccounts: async () => { if (fail) throw { status: 500 }; return [account] },
    createAccount: async () => { posts++; fail = true; return account },
  })
  await second.page.submitForm()
  assert.match(second.page.listError.value, /se creó correctamente.*no se pudo actualizar/)
  assert.equal(second.page.formError.value, '')
  assert.equal(second.page.dialogVisible.value, false)
  fail = false
  await second.page.loadAccounts()
  assert.equal(second.page.listError.value, '')
  assert.equal(posts, 1)
})

test('POST failure keeps the form open and does not reload', async t => {
  const { page, calls } = await setup(t, { createAccount: async () => { throw { status: 500 } } })
  await page.submitForm()
  assert.match(page.formError.value, /No se pudo guardar/)
  assert.equal(page.dialogVisible.value, true)
  assert.equal(calls.length, 1)
})

for (const outcome of ['success', 'failure']) {
  test(`pending POST ${outcome} is discarded after changing company`, async t => {
    const post = deferred()
    const { page, activeCompany, calls } = await setup(t, { createAccount: () => post.promise })
    const saving = page.submitForm()
    activeCompany.value = { id: 'B' }
    await nextTick()
    page.openCreate()
    page.form.name = 'B form'
    if (outcome === 'success') post.resolve(account)
    else post.reject({ status: 500 })
    await saving
    assert.equal(page.form.name, 'B form')
    assert.equal(page.dialogVisible.value, true)
    assert.equal(page.statusMessage.value, '')
    assert.equal(page.formError.value, '')
    assert.deepEqual(calls, [['GET', 'A'], ['GET', 'B']])
  })
}

test('late GET from A cannot replace accounts loaded for B', async t => {
  const reload = deferred()
  let aReads = 0
  const { page, activeCompany } = await setup(t, {
    getAccounts: async id => id === 'B' ? [{ ...account, id: 'B-account' }] : ++aReads === 1 ? [account] : reload.promise,
  })
  const saving = page.submitForm()
  await nextTick()
  activeCompany.value = { id: 'B' }
  await nextTick()
  reload.resolve([account])
  await saving
  assert.equal(page.accounts.value[0].id, 'B-account')
})

test('editing retains filters and the existing update flow', async t => {
  let changes
  const { page } = await setup(t, { updateAccount: async (...args) => { changes = args } })
  page.openEdit(account)
  page.search.value = 'Caja'
  page.form.name = 'Caja principal'
  await page.submitForm()
  assert.deepEqual(changes, ['A', 'new', { name: 'Caja principal' }])
  assert.equal(page.search.value, 'Caja')
  assert.equal(page.statusMessage.value, 'Cuenta actualizada correctamente.')
})
