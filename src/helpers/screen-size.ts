import { useWindowSize } from '@vueuse/core'
import { computed } from 'vue'

const BREAKPOINT_XS = 0
const BREAKPOINT_SM = 576
const BREAKPOINT_MD = 768
const BREAKPOINT_LG = 992
const BREAKPOINT_XL = 1200
const BREAKPOINT_XXL = 1400

export const BREAKPOINTS = {
  xs: BREAKPOINT_XS,
  sm: BREAKPOINT_SM,
  md: BREAKPOINT_MD,
  lg: BREAKPOINT_LG,
  xl: BREAKPOINT_XL,
  xxl: BREAKPOINT_XXL
}

const { width } = useWindowSize()

export const screenSize = {
  isXS: computed(() => width.value >= BREAKPOINT_XS),
  isSM: computed(() => width.value >= BREAKPOINT_SM),
  isMD: computed(() => width.value >= BREAKPOINT_MD),
  isLG: computed(() => width.value >= BREAKPOINT_LG),
  isXL: computed(() => width.value >= BREAKPOINT_XL),
  isXXL: computed(() => width.value >= BREAKPOINT_XXL),
  current: computed(() => {
    if (width.value < BREAKPOINT_SM) return 'xs'
    if (width.value < BREAKPOINT_MD) return 'sm'
    if (width.value < BREAKPOINT_LG) return 'md'
    if (width.value < BREAKPOINT_XL) return 'lg'
    if (width.value < BREAKPOINT_XXL) return 'xl'
    return 'xxl'
  })
}
