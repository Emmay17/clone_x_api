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

// verification pour la creation de l'utilisateur
const registerUserValidatorSchema = vine.object({
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

// verification pour la creation du profile de l'utilisateur 
const registerProfileValidatorSchema = vine.object({
  firstName: vine.string().maxLength(50),
  lastName: vine.string().maxLength(50),
  username: vine
    .string()
    .maxLength(50)
    .unique(async (db, value) => {
      const user = await db.from('profiles').where('username', value).first()
      return !user
    }),
  birthdayDate: vine.date(),
})


const updateUserValidatorSchema = vine.object({
  email: vine.string().minLength(5).maxLength(225).email(),
  password: vine.string().minLength(4).maxLength(255),
})

const emailValidatorSchema = vine.object({
  email: vine.string().email().maxLength(225).normalizeEmail(),
})

export const emailValidator = vine.compile(emailValidatorSchema)
export const registerUserValidator = vine.compile(registerUserValidatorSchema)
export const registerProfileValidator = vine.compile(registerProfileValidatorSchema)
export const loginUserValidator = vine.compile(updateUserValidatorSchema)
