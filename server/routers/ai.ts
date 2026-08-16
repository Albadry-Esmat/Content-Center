import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { protectedProcedure, router } from '../_core/trpc'
import { completeKnownProvider, listProviderAvailability } from '../provider-proxy'

const providerId = z.enum(['openai', 'anthropic', 'google'])
const message = z.object({ role: z.enum(['system', 'user']), content: z.string().trim().min(1).max(20_000) })

export const aiRouter = router({
  providerStatus: protectedProcedure.query(() => listProviderAvailability()),
  complete: protectedProcedure.input(z.object({
    providerId,
    model: z.string().trim().min(1).max(180),
    messages: z.array(message).min(1).max(32),
    temperature: z.number().min(0).max(2),
    maxTokens: z.number().int().min(1).max(16_384),
  })).mutation(async ({ input }) => {
    try {
      return await completeKnownProvider(input)
    } catch (error) {
      throw new TRPCError({ code: 'BAD_GATEWAY', message: error instanceof Error ? error.message : 'Known provider request failed.' })
    }
  }),
})
