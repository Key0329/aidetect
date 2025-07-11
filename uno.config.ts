import {
  defineConfig, 
  transformerDirectives, 
  transformerVariantGroup,
  presetWind3,
} from 'unocss'

export default defineConfig({
  presets: [
    presetWind3(),
  ],
  transformers: [
    transformerDirectives(),
    transformerVariantGroup(),
  ],
  theme: { 
    colors: {
      white: '#ffffff',
      black: '#000000',
      grayscale: {
        100: '#F3F3F3',
        200: '#EEEEEE',
        300: '#DDDDDD',
        400: '#A9A9A9',
        500: '#7E7E7E',
        600: '#292929'
      },
      primary: {
        100: '#EA475B',
        200: '#FF7800',
        300: '#FF9100',
        400: '#FFD6B2',
        500: '#FFEEDF',
        600: '#FFF7F0'
      },
      secondary: {
        100: '#39C8D0',
        200: '#00AFB8',
        300: '#92CF53',
        400: '#6FB827',
        500: '#FFC31B',
      },
      third: {
        100: '#1654B9',
        200: '#4E91FF',
        300: '#78269F',
      }
    },
    fontSize: {
      12: [ '12px', '18px' ],
      14: [ '14px', '20px' ],
      16: [ '16px', '22px' ],
      base: [ '16px', '28px' ],
      18: [ '18px', '24px' ],
      20: [ '20px', '28px' ],
      24: [ '24px', '32px' ],
    },
  },
  shortcuts: [
    {
      'disable': 'bg-primary-400 border-primary-400 cursor-auto',
      'prefix-icon-base': 'flex items-center before:(content-empty w-5 h-5 inline-block mr-2 bg-no-repeat bg-center)',
      'prefix-icon-increase': 'prefix-icon-base before:bg-[url(@/assets/images/icon_increase_light.svg)]',
      'layout-card': 'bg-white px-[10px] py-4 rounded-xl',
    },
    [ /^button-(primary|secondary)-(sm|md|lg)$/, ([ , variant, size ]) => {
      const baseStyles = 'box-border flex items-center justify-center py-2 px-4 text-14 font-bold leading-0 rounded-lg'
      const variants = {
        'primary': 'text-white bg-primary-300',
        'secondary': 'text-primary-300 bg-white border border-primary-300',
      }
      const sizes = {
        'sm': 'h-7',
        'md': 'min-w-26 h-9',
        'lg': 'min-w-41 h-11 text-18',
      }

      const disabledStyles = 'disabled:(bg-primary-400 border-primary-400 cursor-auto)'

      return `${ baseStyles } ${ variants[variant] } ${ sizes[size] } ${ disabledStyles }`
    } ],
  ],
})