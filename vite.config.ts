import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { countryGeometry, createCountryCatalog } from './src/countries'
import { languages } from './src/locales'

export default defineConfig({
  plugins: [react(), {
    name: 'validate-language-packs',
    apply: 'build',
    buildStart() {
      const codes = new Set(countryGeometry.map(country => country.code))
      const locales = new Set<string>()
      for (const language of languages) {
        const { locale, names, aliases } = language
        if (locales.has(locale)) this.error(`Duplicate language: ${locale}`)
        locales.add(locale)
        if (!Intl.DisplayNames.supportedLocalesOf(locale).length) this.error(`Unsupported locale: ${locale}`)
        for (const code of [...Object.keys(names), ...Object.keys(aliases)]) {
          if (!codes.has(code)) this.error(`Unknown country code ${code} in ${locale}`)
        }
        const { countries, normalize } = createCountryCatalog(language)
        for (const { code, name, answers } of countries) {
          if (name === code || !normalize(name) || answers.some(answer => !answer)) {
            this.error(`Missing country name or empty answer for ${code} in ${locale}`)
          }
        }
      }
    },
  }],
  base: './',
})
