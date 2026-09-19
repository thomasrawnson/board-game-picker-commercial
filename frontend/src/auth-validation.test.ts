import assert from 'node:assert/strict'
import { test } from 'node:test'
import { passwordError, registrationErrors } from './auth-validation.ts'

test('password policy matches backend 8–128 Unicode characters without composition rules', () => {
  assert.ok(passwordError('a'.repeat(7)))
  assert.equal(passwordError('a'.repeat(8)), '')
  assert.equal(passwordError('😀'.repeat(128)), '')
  assert.ok(passwordError('😀'.repeat(129)))
})
test('registration associates missing and invalid input with each field', () => {
  assert.deepEqual(Object.keys(registrationErrors('', '', '')).sort(), ['display_name', 'email', 'password'])
  assert.ok(registrationErrors('invalid', 'A', 'abcdefgh').email)
  assert.ok(registrationErrors('a@example.com', 'A'.repeat(101), 'abcdefgh').display_name)
  assert.deepEqual(registrationErrors('a@example.com', 'A', 'abcdefgh'), {})
})
