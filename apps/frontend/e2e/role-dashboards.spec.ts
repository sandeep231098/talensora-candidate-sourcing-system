import { expect, test, type Browser, type Page } from '@playwright/test'

const roleJourneys = [
  { key: 'HR', route: '/hr', heading: 'HR Dashboard' },
  { key: 'ADMIN', route: '/admin', heading: 'Admin Dashboard' },
  { key: 'HIRING_MANAGER', route: '/hiring-manager', heading: 'Hiring Manager Workspace' },
  { key: 'AUDITOR', route: '/auditor', heading: 'Audit & Compliance Workspace' },
  { key: 'ACCOUNTS', route: '/accounts', heading: 'Accounts Workspace' },
] as const

const requiredEnvironment = (name: string): string => {
  const value = process.env[name]
  if (!value) throw new Error(`${name} must be supplied by the isolated E2E environment.`)
  return value
}

async function login(page: Page, username: string, password: string) {
  await page.goto('/login')
  await page.getByRole('button', { name: 'Continue to sign in' }).click()
  await page.getByLabel('Email').fill(username)
  await page.getByRole('textbox', { name: 'Password', exact: true }).fill(password)
  await page.getByRole('button', { name: 'Sign In', exact: true }).click()
}

async function openRoleSession(browser: Browser, role: typeof roleJourneys[number]) {
  const mobile = role.key === 'ACCOUNTS'
  const context = await browser.newContext({
    viewport: mobile
      ? { width: 375, height: 812 }
      : { width: 1280, height: 900 },
  })
  const page = await context.newPage()
  await login(
    page,
    requiredEnvironment(`E2E_${role.key}_EMAIL`),
    requiredEnvironment(`E2E_${role.key}_PASSWORD`),
  )
  await expect(page).toHaveURL(new RegExp(`${role.route}$`))
  await expect(page.getByRole('heading', { name: role.heading, level: 1 })).toBeVisible()

  if (mobile) {
    await page.getByRole('button', { name: 'Open navigation' }).click()
    await expect(page.getByRole('navigation', { name: 'Accounts workspace navigation' })).toBeVisible()
  }

  return { context, page }
}

test('internal roles land on dedicated dashboards and limited roles fail closed', async ({ browser }) => {
  for (const role of roleJourneys) {
    const { context, page } = await openRoleSession(browser, role)

    if (role.key === 'AUDITOR' || role.key === 'ACCOUNTS') {
      await page.goto('/recruiter')
      await expect(page).toHaveURL(/\/forbidden$/)
    }

    await context.close()
  }
})
