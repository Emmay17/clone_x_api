import vine, { SimpleMessagesProvider } from '@vinejs/vine'

vine.messagesProvider = new SimpleMessagesProvider({
    required: 'Le champ {{ field }} est obligatoire',
    minLength: 'Le champ {{ field }} doit avoir au moins {{ min }} caractères',
    maxLength: 'Le champ {{ field }} doit avoir au plus {{ max }} caractères',
    email: 'Le champ {{ field }} doit être une adresse e-mail valide',
    confirmed : 'Le champ {{ field }} doit être identique au champ de passowrd_confirmation',
})

 export const registerUserValidator = vine.compile(
  vine.object({
    fistName: vine.string().maxLength(50),
    lastName: vine.string().maxLength(50),
    email: vine.string().email().maxLength(225),
    password: vine.string().minLength(4).confirmed(),
  })
)


export const updateUserValidator = vine.compile(
    vine.object({
        firstName: vine.string().maxLength(30).optional(),
        lastName: vine.string().maxLength(30).optional(),
        email: vine.string().email().maxLength(225).optional(),
        password: vine.string().minLength(4).confirmed().optional(),
    })
)
