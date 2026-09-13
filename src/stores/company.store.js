import { ref } from 'vue'
import { getCompanies } from '../services/company.service'
import { getActiveCompanyId, saveActiveCompanyId } from '../services/session.service'

export const companies = ref([])
export const activeCompany = ref(null)
export const isLoadingCompanies = ref(false)

export function selectCompany(company) {
  activeCompany.value = company
  saveActiveCompanyId(company?.id)
}

export async function loadCompanies() {
  isLoadingCompanies.value = true

  try {
    companies.value = await getCompanies()

    const activeCompanyId = getActiveCompanyId()
    const savedCompany = companies.value.find((company) => company.id === activeCompanyId)

    if (savedCompany) {
      selectCompany(savedCompany)
    } else if (companies.value.length === 1) {
      selectCompany(companies.value[0])
    } else {
      selectCompany(null)
    }
  } catch (error) {
    companies.value = []
    selectCompany(null)
    throw error
  } finally {
    isLoadingCompanies.value = false
  }
}

export function addCompany(company) {
  companies.value.push(company)
  selectCompany(company)
}