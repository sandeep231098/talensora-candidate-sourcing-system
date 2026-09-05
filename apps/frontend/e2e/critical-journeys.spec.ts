import { expect, test, type Page } from '@playwright/test'

const candidateEmail = process.env.E2E_CANDIDATE_EMAIL
const candidatePassword = process.env.E2E_CANDIDATE_PASSWORD
const recruiterEmail = process.env.E2E_RECRUITER_EMAIL
const recruiterPassword = process.env.E2E_RECRUITER_PASSWORD
const requisitionPath = '/jobs/11111111-1111-4111-8111-111111111111'

const requireCredential = (value: string | undefined, name: string): string => {
  if (!value) {
    throw new Error(`${name} must be supplied by the isolated E2E environment.`)
  }
  return value
}

async function login(page: Page, username: string, password: string) {
  await page.goto('/login')
  await page.getByRole('button', { name: 'Continue to sign in' }).click()
  await page.getByLabel('Email').fill(username)
  await page.getByRole('textbox', { name: 'Password', exact: true }).fill(password)
  await page.getByRole('button', { name: 'Sign In', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Sign out' })).toBeVisible()
}

test.describe.serial('Talensora critical journeys', () => {
  test('public user lists and opens a published job', async ({ page }) => {
    await page.goto('/jobs')
    await expect(page.getByText('E2E Software Engineer')).toBeVisible()
    await page.locator(`a[href="${requisitionPath}"]`).click()
    await expect(page.getByRole('heading', { name: 'E2E Software Engineer' }))
      .toBeVisible()
    await expect(page.getByText('REQ-E2E-001')).toBeVisible()
  })

  test('candidate signs in, completes profile, uploads and applies', async ({ page }) => {
    const email = requireCredential(candidateEmail, 'E2E_CANDIDATE_EMAIL')
    const password = requireCredential(candidatePassword, 'E2E_CANDIDATE_PASSWORD')
    await login(page, email, password)
    await expect(page).toHaveURL(/\/candidate\/dashboard/)
    await expect(page.getByRole('heading', { name: /Welcome back/i })).toBeVisible()
    await page.getByRole('link', { name: 'Profile & resume' }).click()
    await page.goto('/candidate/profile')

    await page.getByLabel('First Name').fill('E2E')
    await page.getByLabel('Last Name').fill('Candidate')
    await page.getByLabel('Mobile Number').fill('+919876543210')
    await page.getByLabel('Current Location').fill('Remote')
    await page.getByLabel('I am a fresher').check()
    await page.getByRole('button', { name: 'Save Personal Information' }).click()

    await page.getByLabel('Degree / Qualification').fill('B.Tech')
    await page.getByLabel('Institution / University').fill('E2E University')
    await page.getByLabel('Year of Passing').fill('2024')
    await page.getByLabel('Education Level').click()
    await page.getByRole('option', { name: "Bachelor's" }).click()
    await page.getByRole('button', { name: 'Add Education' }).click()

    await page.locator('input[type="file"]').setInputFiles({
      name: 'e2e-resume.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('%PDF-1.7\nTalensora E2E resume'),
    })
    await page.getByRole('button', { name: 'Upload Resume' }).click()

    await page.goto('/jobs')
    await page.locator(`a[href="${requisitionPath}"]`).click()
    await page.getByRole('button', { name: 'Apply now' }).click()
    await page.getByRole('button', { name: 'Save & Continue' }).click()
    await page.getByRole('button', { name: 'Continue' }).click()
    await page.getByRole('button', { name: 'Continue' }).click()
    await page.getByRole('button', { name: 'Use Current Resume' }).click()
    await page.getByLabel(/information provided is accurate/i).check()
    await page.getByLabel(/consent to Talensora processing/i).check()
    await page.getByRole('button', { name: 'Submit Application' }).click()

    await expect(page.getByText('Application reference')).toBeVisible()
    await page.locator('main').getByRole('link', { name: 'My Applications' }).click()
    await expect(page.getByText('E2E Software Engineer')).toBeVisible()
  })

  test('recruiter reviews and updates the submitted application', async ({ page }) => {
    const email = requireCredential(recruiterEmail, 'E2E_RECRUITER_EMAIL')
    const password = requireCredential(recruiterPassword, 'E2E_RECRUITER_PASSWORD')
    await login(page, email, password)
    await page.goto('/recruiter')
    await expect(page.getByText(requireCredential(candidateEmail, 'E2E_CANDIDATE_EMAIL')))
      .toBeVisible()
    await page.getByRole('link', { name: 'Review' }).first().click()
    await expect(page.getByRole('heading', { name: 'Application Review' })).toBeVisible()
    await page.getByLabel('Application Status').click()
    await page.getByRole('option', { name: 'Reviewed' }).click()
    await expect(page.getByText('Application status changed to Reviewed.')).toBeVisible()
  })

  test('logout protects authenticated routes', async ({ page }) => {
    await login(
      page,
      requireCredential(candidateEmail, 'E2E_CANDIDATE_EMAIL'),
      requireCredential(candidatePassword, 'E2E_CANDIDATE_PASSWORD'),
    )
    await page.getByRole('button', { name: 'Sign out' }).click()
    await page.goto('/candidate/profile')
    await expect(page).toHaveURL(/\/login/)
  })

  test('candidate cannot access an internal dashboard', async ({ page }) => {
    await login(
      page,
      requireCredential(candidateEmail, 'E2E_CANDIDATE_EMAIL'),
      requireCredential(candidatePassword, 'E2E_CANDIDATE_PASSWORD'),
    )
    await page.goto('/admin')
    await expect(page).toHaveURL(/\/forbidden/)
  })
})
