import vine, { SimpleMessagesProvider } from '@vinejs/vine'

vine.messagesProvider = new SimpleMessagesProvider({
  required: 'Le champ {{ field }} est obligatoire',
  minLength: 'Le champ {{ field }} doit avoir au moins {{ min }} caractères',
  maxLength: 'Le champ {{ field }} doit avoir au plus {{ max }} caractères',
  email: 'Le champ {{ field }} doit être une adresse e-mail valide',
})



export const loginUserValidator = vine.compile(
  vine.object({
    email: vine.string().minLength(5).maxLength(225).email(),
    password: vine.string().minLength(4).maxLength(255)
  })
)
