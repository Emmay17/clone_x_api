import vine from '@vinejs/vine'

const registerSheme = vine.object({
    content: vine.string().minLength(1).optional(),
    user_id: vine.string(),
})

export const tweetRegister = vine.compile(registerSheme)