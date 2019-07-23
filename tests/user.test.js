import { getFirstName, isValidPassword } from '../src/utils/user'

test('Should return first name when given full name', () => {
    const firstName = getFirstName('Rafael Garcia')
    expect(firstName).toBe('Rafael')
})

test('Should return firstname when given first nama', () => {
    const firstName = getFirstName('Jane')
    expect(firstName).toBe('Jane')
})

test('Should reject password less than 8 characters', () => {
    expect(isValidPassword('1222')).toBe(false)
})

test('Should reject a password that contains password', ()=>{
    const isValid = isValidPassword('123password')
    expect(isValid).toBe(false)
})
test('Should correctly validate a valid password',()=>{
    const isValid = isValidPassword('Some12@56')
    expect(isValid).toBe(true)
})