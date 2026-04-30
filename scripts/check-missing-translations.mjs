#!/usr/bin/env node
import fs from 'fs'
import path from 'path'

const LOCALES_DIR = path.join(process.cwd(), 'i18n', 'locales')
const LOCALES = ['en', 'pt-pt', 'fr', 'de', 'es', 'it', 'nl', 'sv', 'no', 'da']

function flattenKeys(obj, prefix = '') {
  const keys = []
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key
    if (typeof value === 'object' && value !== null) {
      keys.push(...flattenKeys(value, fullKey))
    } else {
      keys.push(fullKey)
    }
  }
  return keys
}

function getAllKeys(translations) {
  return flattenKeys(translations)
}

function loadLocale(locale) {
  const filePath = path.join(LOCALES_DIR, `${locale}.json`)
  if (!fs.existsSync(filePath)) {
    console.error(`Locale file not found: ${filePath}`)
    process.exit(1)
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'))
}

function findMissingKeys(baseKeys, compareKeys, locale) {
  const missing = []
  for (const key of baseKeys) {
    if (!compareKeys.has(key)) {
      missing.push(key)
    }
  }
  return missing
}

function findEmptyValues(translations, prefix = '') {
  const empty = []
  for (const [key, value] of Object.entries(translations)) {
    const fullKey = prefix ? `${prefix}.${key}` : key
    if (typeof value === 'object' && value !== null) {
      empty.push(...findEmptyValues(value, fullKey))
    } else if (value === '' || value === null) {
      empty.push(fullKey)
    }
  }
  return empty
}

async function main() {
  console.log('🔍 Checking i18n translation coverage...\n')
  
  const baseLocale = loadLocale('en')
  const baseKeys = new Set(getAllKeys(baseLocale))
  
  let allPassed = true
  const results = []
  
  for (const locale of LOCALES) {
    if (locale === 'en') continue
    
    const localeTranslations = loadLocale(locale)
    const localeKeys = new Set(getAllKeys(localeTranslations))
    
    const missingInLocale = findMissingKeys(baseKeys, localeKeys, locale)
    const emptyValues = findEmptyValues(localeTranslations)
    
    if (missingInLocale.length > 0 || emptyValues.length > 0) {
      allPassed = false
      results.push(`❌ ${locale}:`)
      
      if (missingInLocale.length > 0) {
        results.push(`   Missing keys (${missingInLocale.length}):`)
        missingInLocale.slice(0, 10).forEach(key => {
          results.push(`     - ${key}`)
        })
        if (missingInLocale.length > 10) {
          results.push(`     ... and ${missingInLocale.length - 10} more`)
        }
      }
      
      if (emptyValues.length > 0) {
        results.push(`   Empty values (${emptyValues.length}):`)
        emptyValues.slice(0, 5).forEach(key => {
          results.push(`     - ${key}`)
        })
        if (emptyValues.length > 5) {
          results.push(`     ... and ${emptyValues.length - 5} more`)
        }
      }
    } else {
      results.push(`✅ ${locale}: All keys present`)
    }
  }
  
  console.log(results.join('\n'))
  console.log('')
  
  if (!allPassed) {
    console.error('❌ Translation check FAILED')
    process.exit(1)
  } else {
    console.log('✅ All translations complete')
    process.exit(0)
  }
}

main().catch(error => {
  console.error('Error:', error)
  process.exit(1)
})