import { test, expect } from '@playwright/test'
import { attachPageGuards, gotoReady, TINY_PNG } from './helpers'

test.describe('home translator UI', () => {
  test('core controls, modals, language picker, and upload', async ({ page, baseURL }) => {
    const guards = attachPageGuards(page, new URL(baseURL!).origin)
    await gotoReady(page, '/')

    await expect(page.getByRole('button', { name: 'Choose images' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Process' })).toBeDisabled()
    await expect(page.getByRole('button', { name: 'Reset' })).toBeVisible()
    await expect(page.getByText('Drag & drop zone')).toBeVisible()
    await expect(page.getByRole('navigation', { name: 'More pages' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'How to' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Guides' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Blog' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Videos' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'FAQ' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Featured on Launchory' })).toHaveAttribute(
      'href',
      'https://www.launchory.app/startups/chatreconstruct?ref=badge',
    )

    await page.getByRole('button', { name: 'View plans' }).click()
    const plans = page.getByRole('dialog', { name: 'Choose a plan' })
    await expect(plans).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(plans).toHaveCount(0)

    const signIn = page.getByRole('button', { name: 'Sign in' })
    if (await signIn.isVisible()) {
      await signIn.click()
      const auth = page.getByRole('dialog', { name: 'Sign in' })
      await expect(auth).toBeVisible()
      await page.keyboard.press('Escape')
      await expect(auth).toHaveCount(0)
    } else {
      await expect(page.getByText('Sign in requires API URL')).toBeVisible()
    }

    await page.getByRole('button', { name: /Target language/ }).click()
    const languageList = page.getByRole('listbox', { name: 'Language choices' })
    await expect(languageList).toBeVisible()
    await page.getByPlaceholder('Search country, language, or code…').fill('French')
    await languageList.getByRole('option', { name: /French/ }).click()
    await expect(page.getByRole('button', { name: /Target language, French/ })).toBeVisible()

    await page.getByRole('radio', { name: 'Hurry up' }).check()
    await expect(page.getByRole('radio', { name: 'Hurry up' })).toBeChecked()

    await page.locator('input[type="file"]').setInputFiles({
      name: 'chat-screenshot.png',
      mimeType: 'image/png',
      buffer: TINY_PNG,
    })
    await expect(page.getByRole('button', { name: /Enlarge preview 1/ })).toBeVisible()

    await page.getByRole('button', { name: /Plans, free tier, and billing/ }).hover()
    await expect(page.getByRole('tooltip')).toBeVisible()

    guards.assertClean()
  })

  test('explore chips and support pages round-trip', async ({ page, baseURL }) => {
    const guards = attachPageGuards(page, new URL(baseURL!).origin)
    await gotoReady(page, '/')

    await page.getByRole('link', { name: 'How to' }).click()
    await expect(page).toHaveURL(/\/how-to\/?$/)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('How to use Translate Chat')
    await expect(page.getByRole('heading', { name: 'See the flow in the app' })).toBeVisible()
    await page.getByRole('link', { name: /Back to Translate Chat/ }).click()
    await expect(page).toHaveURL(/\/$/)
    await expect(page.getByRole('button', { name: 'Choose images' })).toBeVisible()

    await page.getByRole('link', { name: 'Guides' }).click()
    await expect(page).toHaveURL(/\/uses\/?$/)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Translation guides')
    await page.getByRole('link', { name: 'Translate Messenger screenshots to English' }).click()
    await expect(page).toHaveURL(/\/translate-messenger-screenshots\/?$/)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Translate Messenger screenshots to English',
    )
    await page.getByRole('link', { name: 'Start translating — upload screenshots' }).click()
    await expect(page).toHaveURL(/\/$/)

    await page.getByRole('link', { name: 'FAQ' }).click()
    await expect(page.getByText('What does Translate Chat do?')).toBeVisible()
    await page.getByRole('link', { name: 'Privacy' }).click()
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Privacy')
    await page.getByRole('link', { name: 'Terms of use →' }).click()
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Terms of use')

    await page.getByRole('link', { name: /Back to Translate Chat/ }).click()
    await page.getByRole('link', { name: 'Contact us' }).click()
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Contact us')
    await expect(page.getByRole('link', { name: 'kamootratnaparat97@gmail.com' })).toBeVisible()

    await page.getByRole('link', { name: /Back to Translate Chat/ }).click()
    await page.getByRole('link', { name: 'Feedback' }).click()
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Feedback')
    await expect(page.getByRole('link', { name: 'Send feedback by email' })).toBeVisible()

    guards.assertClean()
  })

  test('home is usable on a phone-sized viewport', async ({ page, baseURL }) => {
    const guards = attachPageGuards(page, new URL(baseURL!).origin)
    await page.setViewportSize({ width: 390, height: 844 })
    await gotoReady(page, '/')
    await expect(page.getByRole('button', { name: 'Choose images' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Process' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'How to' })).toBeVisible()
    await page.getByRole('button', { name: 'View plans' }).click()
    await expect(page.getByRole('dialog', { name: 'Choose a plan' })).toBeVisible()
    guards.assertClean()
  })
})
