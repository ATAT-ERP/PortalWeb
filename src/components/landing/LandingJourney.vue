<template>
  <svg
    v-if="journeyPaths.length"
    class="landing-journey"
    :viewBox="`0 0 ${size.width} ${size.height}`"
    preserveAspectRatio="none"
    aria-hidden="true"
  >
    <path
      v-for="segment in journeyPaths"
      :key="`track-${segment.name}`"
      class="landing-journey-track"
      :d="segment.path"
    />
    <path
      v-for="segment in journeyPaths"
      :key="segment.name"
      class="landing-journey-progress"
      :d="segment.path"
      pathLength="1"
      stroke-dasharray="1"
      :style="{ strokeDashoffset: 1 - segmentProgress(segment) }"
    />
    <circle :cx="start.x" :cy="start.y" r="5" />
    <circle :cx="end.x" :cy="end.y" r="5" />
  </svg>
</template>

<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = defineProps({
  container: { default: null },
  anchors: { type: Object, required: true }
})

const journeyPaths = ref([])
const progress = ref(1)
const size = ref({ width: 0, height: 0 })
const start = ref({ x: 0, y: 0 })
const end = ref({ x: 0, y: 0 })
let resizeObserver
let motion
let geometryFrame = 0
let scrollFrame = 0

function element(value) {
  return value?.$el || value
}

function point(target, side, containerRect) {
  const rect = element(target).getBoundingClientRect()
  const x = rect.left - containerRect.left
  const y = rect.top - containerRect.top
  if (side === 'top') return { x: x + rect.width / 2, y }
  if (side === 'bottom') return { x: x + rect.width / 2, y: y + rect.height }
  if (side === 'left') return { x, y: y + rect.height / 2 }
  return { x: x + rect.width, y: y + rect.height / 2 }
}

function connector(from, to, direction = 'vertical') {
  const radius = 12
  if (Math.abs(to.x - from.x) < 1) return `M ${from.x} ${from.y} V ${to.y}`
  if (Math.abs(to.y - from.y) < 1) return `M ${from.x} ${from.y} H ${to.x}`
  const horizontalSign = Math.sign(to.x - from.x) || 1
  const verticalSign = Math.sign(to.y - from.y) || 1

  if (direction === 'horizontal') {
    const middleX = (from.x + to.x) / 2
    return `M ${from.x} ${from.y} H ${middleX - radius * horizontalSign} Q ${middleX} ${from.y} ${middleX} ${from.y + radius * verticalSign} V ${to.y - radius * verticalSign} Q ${middleX} ${to.y} ${middleX + radius * horizontalSign} ${to.y} H ${to.x}`
  }

  const middleY = (from.y + to.y) / 2
  return `M ${from.x} ${from.y} V ${middleY - radius * verticalSign} Q ${from.x} ${middleY} ${from.x + radius * horizontalSign} ${middleY} H ${to.x - radius * horizontalSign} Q ${to.x} ${middleY} ${to.x} ${middleY + radius * verticalSign} V ${to.y}`
}

function featureJourney(features, nextHeading, containerRect) {
  const tops = features.map(feature => point(feature, 'top', containerRect))
  const bottoms = features.map(feature => point(feature, 'bottom', containerRect))
  const topY = Math.min(...tops.map(anchor => anchor.y)) - 28
  const bottomY = Math.max(...bottoms.map(anchor => anchor.y)) + 58
  const upperLeft = { x: tops[0].x, y: topY }
  const upperMiddle = { x: tops[1].x, y: topY }
  const upperRight = { x: tops[2].x, y: topY }
  const lowerLeft = { x: bottoms[0].x, y: bottomY }
  const lowerMiddle = { x: bottoms[1].x, y: bottomY }
  const lowerRight = { x: bottoms[2].x, y: bottomY }

  return [
    { name: 'features-top-rail', path: connector(upperLeft, upperRight, 'horizontal'), start: 0.16, end: 0.25 },
    { name: 'features-top-left', path: connector(upperLeft, tops[0], 'vertical'), start: 0.25, end: 0.32 },
    { name: 'features-top-middle', path: connector(upperMiddle, tops[1], 'vertical'), start: 0.3, end: 0.37 },
    { name: 'features-top-right', path: connector(upperRight, tops[2], 'vertical'), start: 0.35, end: 0.42 },
    { name: 'features-bottom-left', path: connector(bottoms[0], lowerLeft, 'vertical'), start: 0.43, end: 0.5 },
    { name: 'features-bottom-middle', path: connector(bottoms[1], lowerMiddle, 'vertical'), start: 0.47, end: 0.54 },
    { name: 'features-bottom-right', path: connector(bottoms[2], lowerRight, 'vertical'), start: 0.51, end: 0.58 },
    { name: 'features-bottom-collector', path: connector(lowerLeft, lowerRight, 'horizontal'), start: 0.56, end: 0.66 },
    { name: 'features-continuation', path: connector(lowerMiddle, point(nextHeading, 'top', containerRect), 'vertical'), start: 0.64, end: 0.74 },
    upperMiddle
  ]
}

function segmentProgress(segment) {
  return Math.max(0, Math.min(1, (progress.value - segment.start) / (segment.end - segment.start)))
}

async function calculateGeometry() {
  geometryFrame = 0
  await nextTick()
  const container = element(props.container)
  const anchors = props.anchors
  const required = [
    container, anchors.hero, anchors.featuresHeading, ...anchors.features,
    anchors.benefitsHeading, ...anchors.benefits, anchors.audienceHeading,
    ...anchors.audience, anchors.closing, anchors.end
  ]
  if (window.innerWidth < 1024 || required.some(target => !element(target))) {
    journeyPaths.value = []
    return
  }

  const containerRect = container.getBoundingClientRect()
  size.value = { width: container.clientWidth, height: container.scrollHeight }
  const featurePaths = featureJourney(anchors.features, anchors.benefitsHeading, containerRect)
  const upperMiddle = featurePaths.pop()
  const fixedSegments = [
    { name: 'hero-to-features', from: anchors.hero, fromSide: 'bottom', to: anchors.featuresHeading, toSide: 'top', direction: 'vertical', start: 0, end: 0.12 },
    { name: 'features-heading', from: anchors.featuresHeading, fromSide: 'bottom', to: upperMiddle, toSide: null, direction: 'vertical', start: 0.1, end: 0.18 }
  ].map(segment => {
    const from = point(segment.from, segment.fromSide, containerRect)
    const to = segment.toSide ? point(segment.to, segment.toSide, containerRect) : segment.to
    return { ...segment, path: connector(from, to, segment.direction), from, to }
  })

  const laterSegments = [
    { name: 'benefits-entry', from: anchors.benefitsHeading, fromSide: 'bottom', to: anchors.benefits[0], toSide: 'top', direction: 'vertical', start: 0.74, end: 0.78 },
    { name: 'benefits-one-two', from: anchors.benefits[0], fromSide: 'right', to: anchors.benefits[1], toSide: 'left', direction: 'horizontal', start: 0.78, end: 0.82 },
    { name: 'benefits-two-three', from: anchors.benefits[1], fromSide: 'right', to: anchors.benefits[2], toSide: 'left', direction: 'horizontal', start: 0.82, end: 0.86 },
    { name: 'benefits-to-audience', from: anchors.benefits[2], fromSide: 'bottom', to: anchors.audienceHeading, toSide: 'top', direction: 'vertical', start: 0.86, end: 0.9 },
    { name: 'audience-entry', from: anchors.audienceHeading, fromSide: 'bottom', to: anchors.audience[0], toSide: 'top', direction: 'vertical', start: 0.9, end: 0.93 },
    { name: 'audience-connection', from: anchors.audience[0], fromSide: 'right', to: anchors.audience[1], toSide: 'left', direction: 'horizontal', start: 0.93, end: 0.96 },
    { name: 'closing-entry', from: anchors.audience[1], fromSide: 'bottom', to: anchors.closing, toSide: 'top', direction: 'vertical', start: 0.96, end: 0.985 },
    { name: 'closing-end', from: anchors.closing, fromSide: 'bottom', to: anchors.end, toSide: 'bottom', direction: 'vertical', start: 0.985, end: 1 }
  ].map(segment => {
    const from = point(segment.from, segment.fromSide, containerRect)
    const to = point(segment.to, segment.toSide, containerRect)
    return { ...segment, path: connector(from, to, segment.direction), from, to }
  })
  start.value = fixedSegments[0].from
  end.value = laterSegments.at(-1).to
  journeyPaths.value = [...fixedSegments, ...featurePaths, ...laterSegments]
  updateProgress()
}

function scheduleGeometry() {
  if (!geometryFrame) geometryFrame = requestAnimationFrame(calculateGeometry)
}

function updateProgress() {
  scrollFrame = 0
  if (!props.container || motion.matches) {
    progress.value = 1
    return
  }
  const rect = element(props.container).getBoundingClientRect()
  const linearProgress = Math.max(0, Math.min(1, (window.innerHeight * 1.0 - rect.top) / (rect.height - window.innerHeight * 0.55)))
  progress.value = linearProgress ** 1.35
}

function scheduleProgress() {
  if (!scrollFrame) scrollFrame = requestAnimationFrame(updateProgress)
}

watch(() => props.anchors, scheduleGeometry)

onMounted(() => {
  motion = window.matchMedia('(prefers-reduced-motion: reduce)')
  resizeObserver = new ResizeObserver(scheduleGeometry)
  if (props.container) resizeObserver.observe(element(props.container))
  window.addEventListener('resize', scheduleGeometry)
  window.addEventListener('scroll', scheduleProgress, { passive: true })
  motion.addEventListener('change', updateProgress)
  scheduleGeometry()
})

onBeforeUnmount(() => {
  cancelAnimationFrame(geometryFrame)
  cancelAnimationFrame(scrollFrame)
  resizeObserver.disconnect()
  window.removeEventListener('resize', scheduleGeometry)
  window.removeEventListener('scroll', scheduleProgress)
  motion.removeEventListener('change', updateProgress)
})
</script>
