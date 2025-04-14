import vine, { SimpleMessagesProvider } from '@vinejs/vine'

vine.messagesProvider = new SimpleMessagesProvider({
  'required': 'Le champ {{ field }} est obligatoire',
  'minLength': 'Le champ {{ field }} doit avoir au moins {{ min }} caractères',
  'maxLength': 'Le champ {{ field }} doit avoir au plus {{ max }} caractères',
  'email': 'Le champ {{ field }} doit être une adresse e-mail valide',
  'username.unique': "Ce nom d'utilisateur est déjà pris",
  'email.unique': 'Cet email est déjà pris',
  'confirmed': 'Le champ {{ field }} doit être identique au champ de passowrd_confirmation',
})

const registerUserValidatorSchema = vine.object({
  fistName: vine.string().maxLength(50),
  lastName: vine.string().maxLength(50),
  username: vine
    .string()
    .maxLength(50)
    .unique(async (db, value) => {
      const user = await db.from('users').where('username', value).first()
      return !user
    }),
  email: vine
    .string()
    .email()
    .maxLength(225)
    .normalizeEmail()
    .unique(async (db, value) => {
      const user = await db.from('users').where('email', value).first()
      return !user
    }),
  password: vine.string().minLength(4).confirmed(),
})

const updateUserValidatorSchema = vine.object({
  email: vine.string().minLength(5).maxLength(225).email(),
  password: vine.string().minLength(4).maxLength(255),
})

export const registerUserValidator = vine.compile(registerUserValidatorSchema)
export const loginUserValidator = vine.compile(updateUserValidatorSchema)
