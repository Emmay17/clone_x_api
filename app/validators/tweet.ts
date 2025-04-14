import vine from '@vinejs/vine'

const registerSheme = vine.object({
    content: vine.string().minLength(1).optional(),
    media: vine.string().minLength(1).optional(),
    parent_tweet: vine.number().optional(),
    user_id: vine.string(),
})

export const tweetRegister = vine.compile(registerSheme)