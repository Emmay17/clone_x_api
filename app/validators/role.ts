import vine , {SimpleMessagesProvider} from '@vinejs/vine'


vine.messagesProvider = new SimpleMessagesProvider({
    minLength: 'Le champ {{ field }} doit avoir au moins {{ min }} caractères',
    maxLength: 'Le champ {{ field }} doit avoir au plus {{ max }} caractères',
    required: 'Le champ {{ field }} est obligatoire',
  })

export const addRole  = vine.compile(
    vine.object({
    label: vine.string().minLength(3).maxLength(50),
    description: vine.string().minLength(5).maxLength(255)
  })
)

export const updateRole = vine.compile(
  vine.object({
    description: vine.string().minLength(5).maxLength(255).optional()
  })
)

