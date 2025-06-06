import vine from '@vinejs/vine'

const registerSheme = vine.object({
    content: vine.string().minLength(1).optional(),
    user_id: vine.string(),
})

const retweetSheme = vine.object({
    tweet_id: vine.string(),
    user_id: vine.string(),
    content: vine.string().minLength(1).optional(),
})

export const tweetRegister = vine.compile(registerSheme)
export const retweetRegister = vine.compile(retweetSheme)