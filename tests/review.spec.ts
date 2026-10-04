import { expect, test, type Page } from '@playwright/test'
const key = 'northstar-review-room-v1'
const role = (page: Page, value: string) => page.getByLabel('Simulate a role').selectOption(value)
async function previewNote(page: Page, trigger: string, text: string) {
  await page.getByRole('button', { name: trigger, exact: true }).click()
  await page.getByLabel('Decision context').fill(text)
  await page.getByRole('button', { name: 'Preview decision', exact: true }).click()
}
async function confirm(page: Page, name: string) {
  await page.getByRole('dialog').getByRole('button', { name, exact: true }).click()
  await expect(page.getByRole('dialog')).toHaveCount(0)
}
async function annotate(page: Page, text = 'Enlarge the date line.', anchor = 'details') {
  await page.getByRole('button', { name: 'Add anchored issue', exact: true }).click()
  await page.getByLabel('Anchor on this version').selectOption(anchor)
  await page.getByLabel('Issue description').fill(text)
  await page.getByRole('button', { name: 'Preview decision', exact: true }).click()
  await confirm(page, 'Confirm issue')
}
async function handoff(page: Page, version = 'v1') { await role(page, 'reviewer'); await previewNote(page, `Hand off ${version}`, `Inspected ${version} headline, artwork and details.`); await confirm(page, 'Confirm handoff') }
async function introduce(page: Page) { await role(page, 'owner'); await page.getByRole('button', { name: 'Introduce bundled v2', exact: true }).click(); await confirm(page, 'Confirm replacement') }
async function approve(page: Page, version = 'v1') { await role(page, 'approver'); await page.getByRole('button', { name: `Approve ${version}`, exact: true }).click(); await expect(page.getByRole('dialog')).toContainText(`Night Garden ${version}`); await confirm(page, `Confirm approval of Night Garden ${version}`) }
test.beforeEach(async ({ page }) => { await page.goto('./'); await page.evaluate(() => localStorage.clear()); await page.reload() })
test('critical version review story: annotation, changes, replacement, exact v2 approval and refresh', async ({ page }) => {
  await annotate(page)
  await previewNote(page, 'Request changes', 'Please enlarge the poster date.')
  await confirm(page, 'Confirm change request')
  await expect(page.getByRole('region', { name: 'Review handoff' })).toContainText('Creative owner')
  await introduce(page)
  await expect(page.getByRole('heading', { name: 'Night Garden v2 · Active', exact: true })).toBeVisible()
  await expect(page.getByRole('complementary', { name: 'Version annotations' })).toContainText('v1 feedback is retained')
  await page.getByRole('button', { name: 'v1 Historical', exact: true }).click()
  await expect(page.getByRole('complementary', { name: 'Version annotations' })).toContainText('Enlarge the date line.')
  await expect(page.getByRole('complementary', { name: 'Version annotations' })).toContainText('poster / v1')
  await page.getByRole('button', { name: 'v2 Active', exact: true }).click()
  await role(page, 'reviewer'); await annotate(page, 'Check the revised date.')
  await previewNote(page, 'Resolve with context', 'The larger date is readable.')
  await confirm(page, 'Confirm resolution')
  await handoff(page, 'v2'); await approve(page, 'v2')
  await page.getByText('Version decision trail (2)', { exact: true }).click()
  await expect(page.getByRole('region', { name: 'Review handoff' })).toContainText('Approved · Night Garden v2')
  await page.reload(); await expect(page.getByRole('heading', { name: 'Night Garden v2 · Active', exact: true })).toBeVisible()
  await expect(page.getByRole('region', { name: 'Review handoff' })).toContainText('Approval covers only Night Garden v2')
})
test('stale approval: approved v1 remains historical and cannot authorize replacement', async ({ page }) => {
  await handoff(page); await approve(page); await introduce(page)
  await role(page, 'approver'); await expect(page.getByRole('button', { name: 'Approve v2', exact: true })).toBeDisabled()
  await page.getByRole('button', { name: 'v1 Historical · Approval on this version', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Approve v1', exact: true })).toBeDisabled()
  await expect(page.getByText('Historical approval', { exact: true })).toBeVisible()
  await expect(page.getByText(/they do not approve Night Garden v2/)).toBeVisible()
  await page.reload(); await expect(page.getByRole('region', { name: 'Review handoff' })).toContainText('inspect Night Garden v2')
})
test('wrong role, unresolved issues and missing handoff block approval', async ({ page }) => {
  await expect(page.getByRole('button', { name: 'Approve v1', exact: true })).toBeDisabled()
  await annotate(page); await expect(page.getByRole('button', { name: 'Hand off v1', exact: true })).toBeDisabled()
  await role(page, 'approver'); await expect(page.getByRole('button', { name: 'Approve v1', exact: true })).toBeDisabled(); await expect(page.getByRole('button', { name: 'Add anchored issue', exact: true })).toBeDisabled()
  await role(page, 'reviewer'); await previewNote(page, 'Resolve with context', 'Reviewed.'); await confirm(page, 'Confirm resolution'); await handoff(page)
  await expect(page.getByRole('button', { name: 'Approve v1', exact: true })).toBeDisabled(); await role(page, 'approver'); await expect(page.getByRole('button', { name: 'Approve v1', exact: true })).toBeEnabled()
})
test('reopen is scoped undo: origin/history remain and approval is revoked', async ({ page }) => {
  await annotate(page); await previewNote(page, 'Resolve with context', 'First resolution.'); await confirm(page, 'Confirm resolution'); await handoff(page); await approve(page)
  await role(page, 'reviewer'); await previewNote(page, 'Reopen issue', 'Needs another check.'); await confirm(page, 'Confirm reopen')
  await expect(page.getByRole('complementary', { name: 'Version annotations' })).toContainText('Enlarge the date line.')
  await page.getByText('Resolution history (2)', { exact: true }).click(); await expect(page.getByRole('complementary', { name: 'Version annotations' })).toContainText('First resolution.'); await expect(page.getByRole('complementary', { name: 'Version annotations' })).toContainText('Needs another check.')
  await page.getByText('Version decision trail (2)', { exact: true }).click(); await expect(page.getByRole('region', { name: 'Review handoff' })).toContainText('Approval revoked · Night Garden v1'); await expect(page.getByRole('button', { name: 'Hand off v1', exact: true })).toBeDisabled()
})
test('handoff recall and approval withdrawal keep explicit history without restoring approval', async ({ page }) => {
  await handoff(page); await approve(page); await previewNote(page, 'Withdraw approval', 'Review again.'); await confirm(page, 'Confirm withdrawal')
  await role(page, 'reviewer'); await handoff(page); await previewNote(page, 'Recall handoff', 'Waiting for another check.'); await confirm(page, 'Confirm recall')
  await page.getByText('Version decision trail (4)', { exact: true }).click(); await expect(page.getByRole('region', { name: 'Review handoff' })).toContainText('Handoff recalled · Night Garden v1'); await expect(page.getByRole('region', { name: 'Review handoff' })).toContainText('Approval revoked')
})
test('v2 change requests give finite-sample guidance rather than impossible v3 introduction', async ({ page }) => {
  await introduce(page); await role(page, 'reviewer'); await annotate(page, 'Double-check the new invitation.')
  await previewNote(page, 'Request changes', 'Review this wording.'); await confirm(page, 'Confirm change request')
  await expect(page.getByRole('region', { name: 'Review handoff' })).toContainText('No further replacement is bundled.')
  await expect(page.getByRole('button', { name: 'Introduce bundled v2', exact: true })).toHaveCount(0)
  await previewNote(page, 'Resolve with context', 'Reviewed current wording.'); await confirm(page, 'Confirm resolution'); await handoff(page, 'v2'); await approve(page, 'v2')
})
test('cancellation and asset/version switches discard unconfirmed drafts without migration', async ({ page }) => {
  await page.getByRole('button', { name: 'Annotate Details · lower left on Night Garden v1', exact: true }).click(); await page.getByLabel('Issue description').fill('Unconfirmed issue.')
  await page.getByRole('button', { name: 'Preview decision', exact: true }).click(); await confirm(page, 'Cancel')
  await expect(page.getByLabel('Issue description')).toHaveValue('Unconfirmed issue.')
  await page.getByRole('button', { name: 'Cancel draft', exact: true }).click(); await expect(page.getByLabel('Issue description')).toHaveCount(0)
  await introduce(page); await role(page, 'reviewer'); await page.getByRole('button', { name: 'Add anchored issue', exact: true }).click(); await page.getByLabel('Issue description').fill('Discard on switch.')
  await page.getByRole('button', { name: 'v1 Historical', exact: true }).click(); await expect(page.getByLabel('Issue description')).toHaveCount(0)
  await page.getByRole('button', { name: 'A little afterglow Campaign banner v1 · Active', exact: true }).click(); await expect(page.getByRole('heading', { name: 'v1 annotations 00', exact: true })).toBeVisible()
  await page.reload(); await expect(page.getByRole('heading', { name: 'v2 annotations 00', exact: true })).toBeVisible()
})
test('keyboard named anchor, native dialog trap, Escape and confirmation focus recovery', async ({ page }) => {
  const anchor = page.getByRole('button', { name: 'Annotate Headline · upper left on Night Garden v1', exact: true }); await anchor.focus(); await page.keyboard.press('Enter')
  await expect(page.getByLabel('Issue description')).toBeFocused(); await page.getByLabel('Issue description').fill('Keyboard issue.'); await page.getByRole('button', { name: 'Preview decision', exact: true }).click()
  const dialog = page.getByRole('dialog'); await expect(dialog.getByRole('button', { name: 'Cancel', exact: true })).toBeFocused()
  await page.keyboard.press('Shift+Tab'); await expect(dialog.getByRole('button', { name: 'Confirm issue', exact: true })).toBeFocused()
  await page.keyboard.press('Tab'); await expect(dialog.getByRole('button', { name: 'Cancel', exact: true })).toBeFocused()
  await page.keyboard.press('Escape'); await expect(dialog).toHaveCount(0); await expect(page.getByRole('button', { name: 'Preview decision', exact: true })).toBeFocused()
  await page.keyboard.press('Enter'); await confirm(page, 'Confirm issue'); await expect(page.getByRole('status')).toBeFocused()
  await role(page, 'owner'); await page.getByRole('button', { name: 'Introduce bundled v2', exact: true }).click(); await confirm(page, 'Confirm replacement'); await expect(page.getByRole('status')).toBeFocused()
})
test('reset cancellation keeps decisions; confirmed reset clears both assets only', async ({ page }) => {
  await annotate(page); await page.getByRole('button', { name: 'A little afterglow Campaign banner v1 · Active', exact: true }).click(); await annotate(page, 'Banner contrast issue.')
  await page.getByRole('button', { name: 'Reset sample', exact: true }).click(); await expect(page.getByRole('dialog')).toContainText('poster and banner'); await confirm(page, 'Cancel'); await expect(page.getByRole('complementary', { name: 'Version annotations' })).toContainText('Banner contrast issue.')
  await page.evaluate(() => localStorage.setItem('unrelated-key', 'preserve'))
  await page.getByRole('button', { name: 'Reset sample', exact: true }).click(); await confirm(page, 'Reset both assets'); await expect(page.getByRole('heading', { name: 'v1 annotations 00', exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Night Garden Campaign poster v1 · Active', exact: true }).click(); await expect(page.getByRole('heading', { name: 'v1 annotations 00', exact: true })).toBeVisible(); expect(await page.evaluate(() => localStorage.getItem('unrelated-key'))).toBe('preserve')
})
test('invalid storage is preserved until explicit reset; reload does not silently repair it', async ({ page }) => {
  await page.evaluate(k => localStorage.setItem(k, '{broken'), key); await page.reload(); await expect(page.getByRole('region', { name: 'Local recovery' })).toContainText('preserved')
  expect(await page.evaluate(k => localStorage.getItem(k), key)).toBe('{broken'); await expect(page.getByRole('button', { name: 'Add anchored issue', exact: true })).toBeDisabled()
  await page.getByRole('button', { name: 'Reset sample', exact: true }).click(); await confirm(page, 'Cancel'); expect(await page.evaluate(k => localStorage.getItem(k), key)).toBe('{broken')
  await page.getByRole('button', { name: 'Reset sample', exact: true }).click(); await confirm(page, 'Reset both assets'); await expect(page.getByRole('button', { name: 'Add anchored issue', exact: true })).toBeEnabled()
})
for (const failure of ['getter', 'getItem', 'setItem']) test(`${failure} failure explains memory-only mode and retains current confirmed action`, async ({ page }) => {
  await page.addInitScript(({ failure }) => { if (failure === 'getter') Object.defineProperty(window, 'localStorage', { get() { throw new Error('unavailable') } }); else Object.defineProperty(Storage.prototype, failure, { value() { throw new Error('unavailable') } }) }, { failure })
  await page.reload(); await annotate(page, 'Kept in current memory.'); await expect(page.getByRole('region', { name: 'Local recovery' })).toContainText('refresh may lose'); await expect(page.getByRole('complementary', { name: 'Version annotations' })).toContainText('Kept in current memory.')
  await page.getByRole('button', { name: 'A little afterglow Campaign banner v1 · Active', exact: true }).click(); await page.getByRole('button', { name: 'Night Garden Campaign poster v1 · Active', exact: true }).click(); await expect(page.getByRole('complementary', { name: 'Version annotations' })).toContainText('Kept in current memory.')
})
test('cross-tab storage event cancels previews and drafts', async ({ page, context }) => {
  const other = await context.newPage(); await other.goto('./')
  await page.getByRole('button', { name: 'Add anchored issue', exact: true }).click(); await page.getByLabel('Issue description').fill('Stale issue.'); await page.getByRole('button', { name: 'Preview decision', exact: true }).click()
  await annotate(other, 'Other tab confirmed.'); await expect(page.getByRole('dialog')).toHaveCount(0); await expect(page.getByLabel('Issue description')).toHaveCount(0); await expect(page.getByRole('complementary', { name: 'Version annotations' })).toContainText('Other tab confirmed.'); await expect(page.getByRole('complementary', { name: 'Version annotations' })).not.toContainText('Stale issue.')
  await other.close()
})
test('same-revision divergence without an event cannot commit stale preview', async ({ page }) => {
  await annotate(page, 'Original saved issue.')
  await page.getByRole('button', { name: 'Add anchored issue', exact: true }).click(); await page.getByLabel('Issue description').fill('Stale addition.'); await page.getByRole('button', { name: 'Preview decision', exact: true }).click()
  await page.evaluate(k => { const s = JSON.parse(localStorage.getItem(k)!); s.assets[0].versions[0].issues[0].text = 'Divergent same-revision issue.'; localStorage.setItem(k, JSON.stringify(s)) }, key)
  await confirm(page, 'Confirm issue'); await expect(page.getByRole('status')).toContainText('Another tab changed'); await expect(page.getByRole('complementary', { name: 'Version annotations' })).toContainText('Divergent same-revision issue.'); await expect(page.getByRole('complementary', { name: 'Version annotations' })).not.toContainText('Stale addition.')
})
test('invalid divergence and failed reset preserve stored bytes and current memory', async ({ page }) => {
  await annotate(page, 'Confirmed memory issue.'); await page.getByRole('button', { name: 'Add anchored issue', exact: true }).click(); await page.getByLabel('Issue description').fill('Pending.'); await page.getByRole('button', { name: 'Preview decision', exact: true }).click()
  await page.evaluate(k => localStorage.setItem(k, 'invalid-external'), key); await confirm(page, 'Confirm issue'); await expect(page.getByRole('complementary', { name: 'Version annotations' })).toContainText('Confirmed memory issue.')
  await page.evaluate(() => { Storage.prototype.setItem = () => { throw new Error('save failed') } }); await page.getByRole('button', { name: 'Reset sample', exact: true }).click(); await confirm(page, 'Reset both assets'); await expect(page.getByRole('status')).toContainText('Invalid data remains preserved'); expect(await page.evaluate(k => localStorage.getItem(k), key)).toBe('invalid-external')
})
test('free text is bounded and rendered as text, with filters retaining original comments', async ({ page }) => {
  await annotate(page, '<img src=x onerror=alert(1)>'); await expect(page.getByRole('complementary', { name: 'Version annotations' })).toContainText('<img src=x onerror=alert(1)>'); await expect(page.locator('.issue img')).toHaveCount(0)
  await previewNote(page, 'Resolve with context', 'Literal text retained.'); await confirm(page, 'Confirm resolution'); await page.getByLabel('Show issues').selectOption('open'); await expect(page.getByText('No open issues on this version.', { exact: true })).toBeVisible(); await page.getByLabel('Show issues').selectOption('resolved'); await expect(page.locator('.issue')).toHaveCount(1)
  await page.getByRole('button', { name: 'Add anchored issue', exact: true }).click(); await expect(page.getByLabel('Issue description')).toHaveAttribute('maxlength', '400')
})
for (const width of [320, 390]) test(`${width}px layout supports anchor issue and confirmation without horizontal overflow`, async ({ page }) => {
  await page.setViewportSize({ width, height: 900 }); await annotate(page, 'Mobile annotation.'); await page.getByRole('button', { name: 'Reset sample', exact: true }).click(); await expect(page.getByRole('dialog')).toBeVisible(); expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true); await confirm(page, 'Cancel'); await page.screenshot({ path: `test-results/review-room-${width}.png`, fullPage: true })
})
test('production media, documentation and network stay local with no console errors', async ({ page }) => {
  const errors: string[] = []; const requests: string[] = []
  page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (m.type() === 'error') errors.push(m.text()) }); page.on('request', r => requests.push(r.url()))
  await page.reload(); await page.getByRole('button', { name: 'A little afterglow Campaign banner v1 · Active', exact: true }).click(); await introduce(page); await page.getByRole('button', { name: 'v1 Historical', exact: true }).click()
  await expect.poll(() => page.locator('img').evaluateAll(imgs => imgs.length > 0 && imgs.every(img => (img as HTMLImageElement).complete && (img as HTMLImageElement).naturalWidth > 0)), { message: 'Every displayed asset finishes loading with valid image dimensions', timeout: 10000 }).toBe(true)
  for (const doc of ['Product_Brief', 'PRD', 'Sample_Contract', 'Case_Study', 'Decisions_and_Risks', 'Validation', 'Sample_Walkthrough']) { const response = await page.request.get(`docs/product/${doc}.md`); expect(response.status()).toBe(200); expect(await response.text()).toMatch(/^# /) }
  expect(errors).toEqual([]); expect(requests.every(url => url.startsWith('http://127.0.0.1:4189/'))).toBe(true)
  await page.setViewportSize({ width: 1440, height: 1000 }); await page.screenshot({ path: 'test-results/review-room-desktop.png', fullPage: true })
})
