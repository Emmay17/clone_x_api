import vine from '@vinejs/vine'

const likeTweetValidator = vine.object({
  tweetId: vine.string(),
  userId: vine.string()
})


export const likeTweetValidatorSchema = vine.compile(likeTweetValidator)