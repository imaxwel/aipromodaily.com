import { z } from 'zod';
import { Prisma } from '@prisma/client';
import Decimal from 'decimal.js';

/////////////////////////////////////////
// HELPER FUNCTIONS
/////////////////////////////////////////

// JSON
//------------------------------------------------------

export type NullableJsonInput = Prisma.JsonValue | null | 'JsonNull' | 'DbNull' | Prisma.NullTypes.DbNull | Prisma.NullTypes.JsonNull;

export const transformJsonNull = (v?: NullableJsonInput) => {
  if (!v || v === 'DbNull') return Prisma.DbNull;
  if (v === 'JsonNull') return Prisma.JsonNull;
  return v;
};

export const JsonValueSchema: z.ZodType<Prisma.JsonValue> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.literal(null),
    z.record(z.lazy(() => JsonValueSchema.optional())),
    z.array(z.lazy(() => JsonValueSchema)),
  ])
);

export type JsonValueType = z.infer<typeof JsonValueSchema>;

export const NullableJsonValue = z
  .union([JsonValueSchema, z.literal('DbNull'), z.literal('JsonNull')])
  .nullable()
  .transform((v) => transformJsonNull(v));

export type NullableJsonValueType = z.infer<typeof NullableJsonValue>;

export const InputJsonValueSchema: z.ZodType<Prisma.InputJsonValue> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.object({ toJSON: z.function(z.tuple([]), z.any()) }),
    z.record(z.lazy(() => z.union([InputJsonValueSchema, z.literal(null)]))),
    z.array(z.lazy(() => z.union([InputJsonValueSchema, z.literal(null)]))),
  ])
);

export type InputJsonValueType = z.infer<typeof InputJsonValueSchema>;

// DECIMAL
//------------------------------------------------------

export const DecimalJsLikeSchema: z.ZodType<Prisma.DecimalJsLike> = z.object({
  d: z.array(z.number()),
  e: z.number(),
  s: z.number(),
  toFixed: z.function(z.tuple([]), z.string()),
})

export const DECIMAL_STRING_REGEX = /^(?:-?Infinity|NaN|-?(?:0[bB][01]+(?:\.[01]+)?(?:[pP][-+]?\d+)?|0[oO][0-7]+(?:\.[0-7]+)?(?:[pP][-+]?\d+)?|0[xX][\da-fA-F]+(?:\.[\da-fA-F]+)?(?:[pP][-+]?\d+)?|(?:\d+|\d*\.\d+)(?:[eE][-+]?\d+)?))$/;

export const isValidDecimalInput =
  (v?: null | string | number | Prisma.DecimalJsLike): v is string | number | Prisma.DecimalJsLike => {
    if (v === undefined || v === null) return false;
    return (
      (typeof v === 'object' && 'd' in v && 'e' in v && 's' in v && 'toFixed' in v) ||
      (typeof v === 'string' && DECIMAL_STRING_REGEX.test(v)) ||
      typeof v === 'number'
    )
  };

/////////////////////////////////////////
// ENUMS
/////////////////////////////////////////

export const TransactionIsolationLevelSchema = z.enum(['ReadUncommitted','ReadCommitted','RepeatableRead','Serializable']);

export const UserScalarFieldEnumSchema = z.enum(['id','name','email','emailVerified','image','createdAt','updatedAt','username','role','banned','banReason','banExpires','onboardingComplete','paymentsCustomerId','locale','membershipLevel']);

export const SessionScalarFieldEnumSchema = z.enum(['id','expiresAt','ipAddress','userAgent','userId','impersonatedBy','activeOrganizationId','token','createdAt','updatedAt']);

export const AccountScalarFieldEnumSchema = z.enum(['id','accountId','providerId','userId','accessToken','refreshToken','idToken','expiresAt','password','accessTokenExpiresAt','refreshTokenExpiresAt','scope','createdAt','updatedAt']);

export const VerificationScalarFieldEnumSchema = z.enum(['id','identifier','value','expiresAt','createdAt','updatedAt']);

export const PasskeyScalarFieldEnumSchema = z.enum(['id','name','publicKey','userId','credentialID','counter','deviceType','backedUp','transports','createdAt']);

export const OrganizationScalarFieldEnumSchema = z.enum(['id','name','slug','logo','createdAt','metadata','paymentsCustomerId']);

export const MemberScalarFieldEnumSchema = z.enum(['id','organizationId','userId','role','createdAt']);

export const InvitationScalarFieldEnumSchema = z.enum(['id','organizationId','email','role','status','expiresAt','inviterId']);

export const PurchaseScalarFieldEnumSchema = z.enum(['id','organizationId','userId','type','customerId','subscriptionId','productId','status','createdAt','updatedAt']);

export const AiChatScalarFieldEnumSchema = z.enum(['id','organizationId','userId','title','messages','createdAt','updatedAt']);

export const BlogPostScalarFieldEnumSchema = z.enum(['id','slug','title','excerpt','content','image','authorId','accessLevel','previewContent','tags','published','publishedAt','viewCount','createdAt','updatedAt']);

export const SubscriptionPlanScalarFieldEnumSchema = z.enum(['id','name','slug','description','price','currency','interval','intervalCount','features','active','createdAt','updatedAt']);

export const UserSubscriptionScalarFieldEnumSchema = z.enum(['id','userId','planId','status','startDate','endDate','cancelledAt','paymentId','paymentMethod','amount','autoRenew','nextBillingDate','createdAt','updatedAt']);

export const BlogCategoryScalarFieldEnumSchema = z.enum(['id','name','slug','description']);

export const SortOrderSchema = z.enum(['asc','desc']);

export const JsonNullValueInputSchema = z.enum(['JsonNull',]).transform((value) => (value === 'JsonNull' ? Prisma.JsonNull : value));

export const QueryModeSchema = z.enum(['default','insensitive']);

export const NullsOrderSchema = z.enum(['first','last']);

export const JsonNullValueFilterSchema = z.enum(['DbNull','JsonNull','AnyNull',]).transform((value) => value === 'JsonNull' ? Prisma.JsonNull : value === 'DbNull' ? Prisma.JsonNull : value === 'AnyNull' ? Prisma.AnyNull : value);

export const PurchaseTypeSchema = z.enum(['SUBSCRIPTION','ONE_TIME']);

export type PurchaseTypeType = `${z.infer<typeof PurchaseTypeSchema>}`

export const AccessLevelSchema = z.enum(['PUBLIC','REGISTERED','PREMIUM']);

export type AccessLevelType = `${z.infer<typeof AccessLevelSchema>}`

export const PlanIntervalSchema = z.enum(['MONTH','YEAR','LIFETIME']);

export type PlanIntervalType = `${z.infer<typeof PlanIntervalSchema>}`

export const SubscriptionStatusSchema = z.enum(['ACTIVE','EXPIRED','CANCELLED','PENDING','TRIAL']);

export type SubscriptionStatusType = `${z.infer<typeof SubscriptionStatusSchema>}`

export const MembershipLevelSchema = z.enum(['FREE','BASIC','PREMIUM','LIFETIME']);

export type MembershipLevelType = `${z.infer<typeof MembershipLevelSchema>}`

/////////////////////////////////////////
// MODELS
/////////////////////////////////////////

/////////////////////////////////////////
// USER SCHEMA
/////////////////////////////////////////

export const UserSchema = z.object({
  membershipLevel: MembershipLevelSchema,
  id: z.string().cuid(),
  name: z.string(),
  email: z.string(),
  emailVerified: z.boolean(),
  image: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  username: z.string().nullable(),
  role: z.string().nullable(),
  banned: z.boolean().nullable(),
  banReason: z.string().nullable(),
  banExpires: z.coerce.date().nullable(),
  onboardingComplete: z.boolean(),
  paymentsCustomerId: z.string().nullable(),
  locale: z.string().nullable(),
})

export type User = z.infer<typeof UserSchema>

/////////////////////////////////////////
// SESSION SCHEMA
/////////////////////////////////////////

export const SessionSchema = z.object({
  id: z.string().cuid(),
  expiresAt: z.coerce.date(),
  ipAddress: z.string().nullable(),
  userAgent: z.string().nullable(),
  userId: z.string(),
  impersonatedBy: z.string().nullable(),
  activeOrganizationId: z.string().nullable(),
  token: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type Session = z.infer<typeof SessionSchema>

/////////////////////////////////////////
// ACCOUNT SCHEMA
/////////////////////////////////////////

export const AccountSchema = z.object({
  id: z.string().cuid(),
  accountId: z.string(),
  providerId: z.string(),
  userId: z.string(),
  accessToken: z.string().nullable(),
  refreshToken: z.string().nullable(),
  idToken: z.string().nullable(),
  expiresAt: z.coerce.date().nullable(),
  password: z.string().nullable(),
  accessTokenExpiresAt: z.coerce.date().nullable(),
  refreshTokenExpiresAt: z.coerce.date().nullable(),
  scope: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type Account = z.infer<typeof AccountSchema>

/////////////////////////////////////////
// VERIFICATION SCHEMA
/////////////////////////////////////////

export const VerificationSchema = z.object({
  id: z.string().cuid(),
  identifier: z.string(),
  value: z.string(),
  expiresAt: z.coerce.date(),
  createdAt: z.coerce.date().nullable(),
  updatedAt: z.coerce.date().nullable(),
})

export type Verification = z.infer<typeof VerificationSchema>

/////////////////////////////////////////
// PASSKEY SCHEMA
/////////////////////////////////////////

export const PasskeySchema = z.object({
  id: z.string().cuid(),
  name: z.string().nullable(),
  publicKey: z.string(),
  userId: z.string(),
  credentialID: z.string(),
  counter: z.number().int(),
  deviceType: z.string(),
  backedUp: z.boolean(),
  transports: z.string().nullable(),
  createdAt: z.coerce.date().nullable(),
})

export type Passkey = z.infer<typeof PasskeySchema>

/////////////////////////////////////////
// ORGANIZATION SCHEMA
/////////////////////////////////////////

export const OrganizationSchema = z.object({
  id: z.string().cuid(),
  name: z.string(),
  slug: z.string().nullable(),
  logo: z.string().nullable(),
  createdAt: z.coerce.date(),
  metadata: z.string().nullable(),
  paymentsCustomerId: z.string().nullable(),
})

export type Organization = z.infer<typeof OrganizationSchema>

/////////////////////////////////////////
// MEMBER SCHEMA
/////////////////////////////////////////

export const MemberSchema = z.object({
  id: z.string().cuid(),
  organizationId: z.string(),
  userId: z.string(),
  role: z.string(),
  createdAt: z.coerce.date(),
})

export type Member = z.infer<typeof MemberSchema>

/////////////////////////////////////////
// INVITATION SCHEMA
/////////////////////////////////////////

export const InvitationSchema = z.object({
  id: z.string().cuid(),
  organizationId: z.string(),
  email: z.string(),
  role: z.string().nullable(),
  status: z.string(),
  expiresAt: z.coerce.date(),
  inviterId: z.string(),
})

export type Invitation = z.infer<typeof InvitationSchema>

/////////////////////////////////////////
// PURCHASE SCHEMA
/////////////////////////////////////////

export const PurchaseSchema = z.object({
  type: PurchaseTypeSchema,
  id: z.string().cuid(),
  organizationId: z.string().nullable(),
  userId: z.string().nullable(),
  customerId: z.string(),
  subscriptionId: z.string().nullable(),
  productId: z.string(),
  status: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type Purchase = z.infer<typeof PurchaseSchema>

/////////////////////////////////////////
// AI CHAT SCHEMA
/////////////////////////////////////////

export const AiChatSchema = z.object({
  id: z.string().cuid(),
  organizationId: z.string().nullable(),
  userId: z.string().nullable(),
  title: z.string().nullable(),
  /**
   * [Array<{role: "user" | "assistant"; content: string;}>]
   */
  messages: z.array(z.object({ role: z.enum(['user', 'assistant']), content: z.string() })),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type AiChat = z.infer<typeof AiChatSchema>

/////////////////////////////////////////
// BLOG POST SCHEMA
/////////////////////////////////////////

export const BlogPostSchema = z.object({
  accessLevel: AccessLevelSchema,
  id: z.string().cuid(),
  slug: z.string(),
  title: z.string(),
  excerpt: z.string().nullable(),
  content: z.string(),
  image: z.string().nullable(),
  authorId: z.string(),
  previewContent: z.string().nullable(),
  tags: z.string().array(),
  published: z.boolean(),
  publishedAt: z.coerce.date().nullable(),
  viewCount: z.number().int(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type BlogPost = z.infer<typeof BlogPostSchema>

/////////////////////////////////////////
// SUBSCRIPTION PLAN SCHEMA
/////////////////////////////////////////

export const SubscriptionPlanSchema = z.object({
  interval: PlanIntervalSchema,
  id: z.string().cuid(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  price: z.instanceof(Prisma.Decimal, { message: "Field 'price' must be a Decimal. Location: ['Models', 'SubscriptionPlan']"}),
  currency: z.string(),
  intervalCount: z.number().int(),
  features: JsonValueSchema,
  active: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type SubscriptionPlan = z.infer<typeof SubscriptionPlanSchema>

/////////////////////////////////////////
// USER SUBSCRIPTION SCHEMA
/////////////////////////////////////////

export const UserSubscriptionSchema = z.object({
  status: SubscriptionStatusSchema,
  id: z.string().cuid(),
  userId: z.string(),
  planId: z.string(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().nullable(),
  cancelledAt: z.coerce.date().nullable(),
  paymentId: z.string().nullable(),
  paymentMethod: z.string().nullable(),
  amount: z.instanceof(Prisma.Decimal, { message: "Field 'amount' must be a Decimal. Location: ['Models', 'UserSubscription']"}),
  autoRenew: z.boolean(),
  nextBillingDate: z.coerce.date().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type UserSubscription = z.infer<typeof UserSubscriptionSchema>

/////////////////////////////////////////
// BLOG CATEGORY SCHEMA
/////////////////////////////////////////

export const BlogCategorySchema = z.object({
  id: z.string().cuid(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
})

export type BlogCategory = z.infer<typeof BlogCategorySchema>

/////////////////////////////////////////
// SELECT & INCLUDE
/////////////////////////////////////////

// USER
//------------------------------------------------------

export const UserIncludeSchema: z.ZodType<Prisma.UserInclude> = z.object({
  sessions: z.union([z.boolean(),z.lazy(() => SessionFindManyArgsSchema)]).optional(),
  accounts: z.union([z.boolean(),z.lazy(() => AccountFindManyArgsSchema)]).optional(),
  passkeys: z.union([z.boolean(),z.lazy(() => PasskeyFindManyArgsSchema)]).optional(),
  invitations: z.union([z.boolean(),z.lazy(() => InvitationFindManyArgsSchema)]).optional(),
  purchases: z.union([z.boolean(),z.lazy(() => PurchaseFindManyArgsSchema)]).optional(),
  memberships: z.union([z.boolean(),z.lazy(() => MemberFindManyArgsSchema)]).optional(),
  aiChats: z.union([z.boolean(),z.lazy(() => AiChatFindManyArgsSchema)]).optional(),
  subscriptions: z.union([z.boolean(),z.lazy(() => UserSubscriptionFindManyArgsSchema)]).optional(),
  blogPosts: z.union([z.boolean(),z.lazy(() => BlogPostFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => UserCountOutputTypeArgsSchema)]).optional(),
}).strict()

export const UserArgsSchema: z.ZodType<Prisma.UserDefaultArgs> = z.object({
  select: z.lazy(() => UserSelectSchema).optional(),
  include: z.lazy(() => UserIncludeSchema).optional(),
}).strict();

export const UserCountOutputTypeArgsSchema: z.ZodType<Prisma.UserCountOutputTypeDefaultArgs> = z.object({
  select: z.lazy(() => UserCountOutputTypeSelectSchema).nullish(),
}).strict();

export const UserCountOutputTypeSelectSchema: z.ZodType<Prisma.UserCountOutputTypeSelect> = z.object({
  sessions: z.boolean().optional(),
  accounts: z.boolean().optional(),
  passkeys: z.boolean().optional(),
  invitations: z.boolean().optional(),
  purchases: z.boolean().optional(),
  memberships: z.boolean().optional(),
  aiChats: z.boolean().optional(),
  subscriptions: z.boolean().optional(),
  blogPosts: z.boolean().optional(),
}).strict();

export const UserSelectSchema: z.ZodType<Prisma.UserSelect> = z.object({
  id: z.boolean().optional(),
  name: z.boolean().optional(),
  email: z.boolean().optional(),
  emailVerified: z.boolean().optional(),
  image: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
  username: z.boolean().optional(),
  role: z.boolean().optional(),
  banned: z.boolean().optional(),
  banReason: z.boolean().optional(),
  banExpires: z.boolean().optional(),
  onboardingComplete: z.boolean().optional(),
  paymentsCustomerId: z.boolean().optional(),
  locale: z.boolean().optional(),
  membershipLevel: z.boolean().optional(),
  sessions: z.union([z.boolean(),z.lazy(() => SessionFindManyArgsSchema)]).optional(),
  accounts: z.union([z.boolean(),z.lazy(() => AccountFindManyArgsSchema)]).optional(),
  passkeys: z.union([z.boolean(),z.lazy(() => PasskeyFindManyArgsSchema)]).optional(),
  invitations: z.union([z.boolean(),z.lazy(() => InvitationFindManyArgsSchema)]).optional(),
  purchases: z.union([z.boolean(),z.lazy(() => PurchaseFindManyArgsSchema)]).optional(),
  memberships: z.union([z.boolean(),z.lazy(() => MemberFindManyArgsSchema)]).optional(),
  aiChats: z.union([z.boolean(),z.lazy(() => AiChatFindManyArgsSchema)]).optional(),
  subscriptions: z.union([z.boolean(),z.lazy(() => UserSubscriptionFindManyArgsSchema)]).optional(),
  blogPosts: z.union([z.boolean(),z.lazy(() => BlogPostFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => UserCountOutputTypeArgsSchema)]).optional(),
}).strict()

// SESSION
//------------------------------------------------------

export const SessionIncludeSchema: z.ZodType<Prisma.SessionInclude> = z.object({
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
}).strict()

export const SessionArgsSchema: z.ZodType<Prisma.SessionDefaultArgs> = z.object({
  select: z.lazy(() => SessionSelectSchema).optional(),
  include: z.lazy(() => SessionIncludeSchema).optional(),
}).strict();

export const SessionSelectSchema: z.ZodType<Prisma.SessionSelect> = z.object({
  id: z.boolean().optional(),
  expiresAt: z.boolean().optional(),
  ipAddress: z.boolean().optional(),
  userAgent: z.boolean().optional(),
  userId: z.boolean().optional(),
  impersonatedBy: z.boolean().optional(),
  activeOrganizationId: z.boolean().optional(),
  token: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
}).strict()

// ACCOUNT
//------------------------------------------------------

export const AccountIncludeSchema: z.ZodType<Prisma.AccountInclude> = z.object({
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
}).strict()

export const AccountArgsSchema: z.ZodType<Prisma.AccountDefaultArgs> = z.object({
  select: z.lazy(() => AccountSelectSchema).optional(),
  include: z.lazy(() => AccountIncludeSchema).optional(),
}).strict();

export const AccountSelectSchema: z.ZodType<Prisma.AccountSelect> = z.object({
  id: z.boolean().optional(),
  accountId: z.boolean().optional(),
  providerId: z.boolean().optional(),
  userId: z.boolean().optional(),
  accessToken: z.boolean().optional(),
  refreshToken: z.boolean().optional(),
  idToken: z.boolean().optional(),
  expiresAt: z.boolean().optional(),
  password: z.boolean().optional(),
  accessTokenExpiresAt: z.boolean().optional(),
  refreshTokenExpiresAt: z.boolean().optional(),
  scope: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
}).strict()

// VERIFICATION
//------------------------------------------------------

export const VerificationSelectSchema: z.ZodType<Prisma.VerificationSelect> = z.object({
  id: z.boolean().optional(),
  identifier: z.boolean().optional(),
  value: z.boolean().optional(),
  expiresAt: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
}).strict()

// PASSKEY
//------------------------------------------------------

export const PasskeyIncludeSchema: z.ZodType<Prisma.PasskeyInclude> = z.object({
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
}).strict()

export const PasskeyArgsSchema: z.ZodType<Prisma.PasskeyDefaultArgs> = z.object({
  select: z.lazy(() => PasskeySelectSchema).optional(),
  include: z.lazy(() => PasskeyIncludeSchema).optional(),
}).strict();

export const PasskeySelectSchema: z.ZodType<Prisma.PasskeySelect> = z.object({
  id: z.boolean().optional(),
  name: z.boolean().optional(),
  publicKey: z.boolean().optional(),
  userId: z.boolean().optional(),
  credentialID: z.boolean().optional(),
  counter: z.boolean().optional(),
  deviceType: z.boolean().optional(),
  backedUp: z.boolean().optional(),
  transports: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
}).strict()

// ORGANIZATION
//------------------------------------------------------

export const OrganizationIncludeSchema: z.ZodType<Prisma.OrganizationInclude> = z.object({
  members: z.union([z.boolean(),z.lazy(() => MemberFindManyArgsSchema)]).optional(),
  invitations: z.union([z.boolean(),z.lazy(() => InvitationFindManyArgsSchema)]).optional(),
  purchases: z.union([z.boolean(),z.lazy(() => PurchaseFindManyArgsSchema)]).optional(),
  aiChats: z.union([z.boolean(),z.lazy(() => AiChatFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => OrganizationCountOutputTypeArgsSchema)]).optional(),
}).strict()

export const OrganizationArgsSchema: z.ZodType<Prisma.OrganizationDefaultArgs> = z.object({
  select: z.lazy(() => OrganizationSelectSchema).optional(),
  include: z.lazy(() => OrganizationIncludeSchema).optional(),
}).strict();

export const OrganizationCountOutputTypeArgsSchema: z.ZodType<Prisma.OrganizationCountOutputTypeDefaultArgs> = z.object({
  select: z.lazy(() => OrganizationCountOutputTypeSelectSchema).nullish(),
}).strict();

export const OrganizationCountOutputTypeSelectSchema: z.ZodType<Prisma.OrganizationCountOutputTypeSelect> = z.object({
  members: z.boolean().optional(),
  invitations: z.boolean().optional(),
  purchases: z.boolean().optional(),
  aiChats: z.boolean().optional(),
}).strict();

export const OrganizationSelectSchema: z.ZodType<Prisma.OrganizationSelect> = z.object({
  id: z.boolean().optional(),
  name: z.boolean().optional(),
  slug: z.boolean().optional(),
  logo: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  metadata: z.boolean().optional(),
  paymentsCustomerId: z.boolean().optional(),
  members: z.union([z.boolean(),z.lazy(() => MemberFindManyArgsSchema)]).optional(),
  invitations: z.union([z.boolean(),z.lazy(() => InvitationFindManyArgsSchema)]).optional(),
  purchases: z.union([z.boolean(),z.lazy(() => PurchaseFindManyArgsSchema)]).optional(),
  aiChats: z.union([z.boolean(),z.lazy(() => AiChatFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => OrganizationCountOutputTypeArgsSchema)]).optional(),
}).strict()

// MEMBER
//------------------------------------------------------

export const MemberIncludeSchema: z.ZodType<Prisma.MemberInclude> = z.object({
  organization: z.union([z.boolean(),z.lazy(() => OrganizationArgsSchema)]).optional(),
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
}).strict()

export const MemberArgsSchema: z.ZodType<Prisma.MemberDefaultArgs> = z.object({
  select: z.lazy(() => MemberSelectSchema).optional(),
  include: z.lazy(() => MemberIncludeSchema).optional(),
}).strict();

export const MemberSelectSchema: z.ZodType<Prisma.MemberSelect> = z.object({
  id: z.boolean().optional(),
  organizationId: z.boolean().optional(),
  userId: z.boolean().optional(),
  role: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  organization: z.union([z.boolean(),z.lazy(() => OrganizationArgsSchema)]).optional(),
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
}).strict()

// INVITATION
//------------------------------------------------------

export const InvitationIncludeSchema: z.ZodType<Prisma.InvitationInclude> = z.object({
  organization: z.union([z.boolean(),z.lazy(() => OrganizationArgsSchema)]).optional(),
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
}).strict()

export const InvitationArgsSchema: z.ZodType<Prisma.InvitationDefaultArgs> = z.object({
  select: z.lazy(() => InvitationSelectSchema).optional(),
  include: z.lazy(() => InvitationIncludeSchema).optional(),
}).strict();

export const InvitationSelectSchema: z.ZodType<Prisma.InvitationSelect> = z.object({
  id: z.boolean().optional(),
  organizationId: z.boolean().optional(),
  email: z.boolean().optional(),
  role: z.boolean().optional(),
  status: z.boolean().optional(),
  expiresAt: z.boolean().optional(),
  inviterId: z.boolean().optional(),
  organization: z.union([z.boolean(),z.lazy(() => OrganizationArgsSchema)]).optional(),
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
}).strict()

// PURCHASE
//------------------------------------------------------

export const PurchaseIncludeSchema: z.ZodType<Prisma.PurchaseInclude> = z.object({
  organization: z.union([z.boolean(),z.lazy(() => OrganizationArgsSchema)]).optional(),
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
}).strict()

export const PurchaseArgsSchema: z.ZodType<Prisma.PurchaseDefaultArgs> = z.object({
  select: z.lazy(() => PurchaseSelectSchema).optional(),
  include: z.lazy(() => PurchaseIncludeSchema).optional(),
}).strict();

export const PurchaseSelectSchema: z.ZodType<Prisma.PurchaseSelect> = z.object({
  id: z.boolean().optional(),
  organizationId: z.boolean().optional(),
  userId: z.boolean().optional(),
  type: z.boolean().optional(),
  customerId: z.boolean().optional(),
  subscriptionId: z.boolean().optional(),
  productId: z.boolean().optional(),
  status: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
  organization: z.union([z.boolean(),z.lazy(() => OrganizationArgsSchema)]).optional(),
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
}).strict()

// AI CHAT
//------------------------------------------------------

export const AiChatIncludeSchema: z.ZodType<Prisma.AiChatInclude> = z.object({
  organization: z.union([z.boolean(),z.lazy(() => OrganizationArgsSchema)]).optional(),
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
}).strict()

export const AiChatArgsSchema: z.ZodType<Prisma.AiChatDefaultArgs> = z.object({
  select: z.lazy(() => AiChatSelectSchema).optional(),
  include: z.lazy(() => AiChatIncludeSchema).optional(),
}).strict();

export const AiChatSelectSchema: z.ZodType<Prisma.AiChatSelect> = z.object({
  id: z.boolean().optional(),
  organizationId: z.boolean().optional(),
  userId: z.boolean().optional(),
  title: z.boolean().optional(),
  messages: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
  organization: z.union([z.boolean(),z.lazy(() => OrganizationArgsSchema)]).optional(),
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
}).strict()

// BLOG POST
//------------------------------------------------------

export const BlogPostIncludeSchema: z.ZodType<Prisma.BlogPostInclude> = z.object({
  author: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
  categories: z.union([z.boolean(),z.lazy(() => BlogCategoryFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => BlogPostCountOutputTypeArgsSchema)]).optional(),
}).strict()

export const BlogPostArgsSchema: z.ZodType<Prisma.BlogPostDefaultArgs> = z.object({
  select: z.lazy(() => BlogPostSelectSchema).optional(),
  include: z.lazy(() => BlogPostIncludeSchema).optional(),
}).strict();

export const BlogPostCountOutputTypeArgsSchema: z.ZodType<Prisma.BlogPostCountOutputTypeDefaultArgs> = z.object({
  select: z.lazy(() => BlogPostCountOutputTypeSelectSchema).nullish(),
}).strict();

export const BlogPostCountOutputTypeSelectSchema: z.ZodType<Prisma.BlogPostCountOutputTypeSelect> = z.object({
  categories: z.boolean().optional(),
}).strict();

export const BlogPostSelectSchema: z.ZodType<Prisma.BlogPostSelect> = z.object({
  id: z.boolean().optional(),
  slug: z.boolean().optional(),
  title: z.boolean().optional(),
  excerpt: z.boolean().optional(),
  content: z.boolean().optional(),
  image: z.boolean().optional(),
  authorId: z.boolean().optional(),
  accessLevel: z.boolean().optional(),
  previewContent: z.boolean().optional(),
  tags: z.boolean().optional(),
  published: z.boolean().optional(),
  publishedAt: z.boolean().optional(),
  viewCount: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
  author: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
  categories: z.union([z.boolean(),z.lazy(() => BlogCategoryFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => BlogPostCountOutputTypeArgsSchema)]).optional(),
}).strict()

// SUBSCRIPTION PLAN
//------------------------------------------------------

export const SubscriptionPlanIncludeSchema: z.ZodType<Prisma.SubscriptionPlanInclude> = z.object({
  subscriptions: z.union([z.boolean(),z.lazy(() => UserSubscriptionFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => SubscriptionPlanCountOutputTypeArgsSchema)]).optional(),
}).strict()

export const SubscriptionPlanArgsSchema: z.ZodType<Prisma.SubscriptionPlanDefaultArgs> = z.object({
  select: z.lazy(() => SubscriptionPlanSelectSchema).optional(),
  include: z.lazy(() => SubscriptionPlanIncludeSchema).optional(),
}).strict();

export const SubscriptionPlanCountOutputTypeArgsSchema: z.ZodType<Prisma.SubscriptionPlanCountOutputTypeDefaultArgs> = z.object({
  select: z.lazy(() => SubscriptionPlanCountOutputTypeSelectSchema).nullish(),
}).strict();

export const SubscriptionPlanCountOutputTypeSelectSchema: z.ZodType<Prisma.SubscriptionPlanCountOutputTypeSelect> = z.object({
  subscriptions: z.boolean().optional(),
}).strict();

export const SubscriptionPlanSelectSchema: z.ZodType<Prisma.SubscriptionPlanSelect> = z.object({
  id: z.boolean().optional(),
  name: z.boolean().optional(),
  slug: z.boolean().optional(),
  description: z.boolean().optional(),
  price: z.boolean().optional(),
  currency: z.boolean().optional(),
  interval: z.boolean().optional(),
  intervalCount: z.boolean().optional(),
  features: z.boolean().optional(),
  active: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
  subscriptions: z.union([z.boolean(),z.lazy(() => UserSubscriptionFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => SubscriptionPlanCountOutputTypeArgsSchema)]).optional(),
}).strict()

// USER SUBSCRIPTION
//------------------------------------------------------

export const UserSubscriptionIncludeSchema: z.ZodType<Prisma.UserSubscriptionInclude> = z.object({
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
  plan: z.union([z.boolean(),z.lazy(() => SubscriptionPlanArgsSchema)]).optional(),
}).strict()

export const UserSubscriptionArgsSchema: z.ZodType<Prisma.UserSubscriptionDefaultArgs> = z.object({
  select: z.lazy(() => UserSubscriptionSelectSchema).optional(),
  include: z.lazy(() => UserSubscriptionIncludeSchema).optional(),
}).strict();

export const UserSubscriptionSelectSchema: z.ZodType<Prisma.UserSubscriptionSelect> = z.object({
  id: z.boolean().optional(),
  userId: z.boolean().optional(),
  planId: z.boolean().optional(),
  status: z.boolean().optional(),
  startDate: z.boolean().optional(),
  endDate: z.boolean().optional(),
  cancelledAt: z.boolean().optional(),
  paymentId: z.boolean().optional(),
  paymentMethod: z.boolean().optional(),
  amount: z.boolean().optional(),
  autoRenew: z.boolean().optional(),
  nextBillingDate: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
  plan: z.union([z.boolean(),z.lazy(() => SubscriptionPlanArgsSchema)]).optional(),
}).strict()

// BLOG CATEGORY
//------------------------------------------------------

export const BlogCategoryIncludeSchema: z.ZodType<Prisma.BlogCategoryInclude> = z.object({
  posts: z.union([z.boolean(),z.lazy(() => BlogPostFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => BlogCategoryCountOutputTypeArgsSchema)]).optional(),
}).strict()

export const BlogCategoryArgsSchema: z.ZodType<Prisma.BlogCategoryDefaultArgs> = z.object({
  select: z.lazy(() => BlogCategorySelectSchema).optional(),
  include: z.lazy(() => BlogCategoryIncludeSchema).optional(),
}).strict();

export const BlogCategoryCountOutputTypeArgsSchema: z.ZodType<Prisma.BlogCategoryCountOutputTypeDefaultArgs> = z.object({
  select: z.lazy(() => BlogCategoryCountOutputTypeSelectSchema).nullish(),
}).strict();

export const BlogCategoryCountOutputTypeSelectSchema: z.ZodType<Prisma.BlogCategoryCountOutputTypeSelect> = z.object({
  posts: z.boolean().optional(),
}).strict();

export const BlogCategorySelectSchema: z.ZodType<Prisma.BlogCategorySelect> = z.object({
  id: z.boolean().optional(),
  name: z.boolean().optional(),
  slug: z.boolean().optional(),
  description: z.boolean().optional(),
  posts: z.union([z.boolean(),z.lazy(() => BlogPostFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => BlogCategoryCountOutputTypeArgsSchema)]).optional(),
}).strict()


/////////////////////////////////////////
// INPUT TYPES
/////////////////////////////////////////

export const UserWhereInputSchema: z.ZodType<Prisma.UserWhereInput> = z.object({
  AND: z.union([ z.lazy(() => UserWhereInputSchema),z.lazy(() => UserWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => UserWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UserWhereInputSchema),z.lazy(() => UserWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  name: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  email: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  emailVerified: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  image: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  username: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  role: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  banned: z.union([ z.lazy(() => BoolNullableFilterSchema),z.boolean() ]).optional().nullable(),
  banReason: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  banExpires: z.union([ z.lazy(() => DateTimeNullableFilterSchema),z.coerce.date() ]).optional().nullable(),
  onboardingComplete: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  paymentsCustomerId: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  locale: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  membershipLevel: z.union([ z.lazy(() => EnumMembershipLevelFilterSchema),z.lazy(() => MembershipLevelSchema) ]).optional(),
  sessions: z.lazy(() => SessionListRelationFilterSchema).optional(),
  accounts: z.lazy(() => AccountListRelationFilterSchema).optional(),
  passkeys: z.lazy(() => PasskeyListRelationFilterSchema).optional(),
  invitations: z.lazy(() => InvitationListRelationFilterSchema).optional(),
  purchases: z.lazy(() => PurchaseListRelationFilterSchema).optional(),
  memberships: z.lazy(() => MemberListRelationFilterSchema).optional(),
  aiChats: z.lazy(() => AiChatListRelationFilterSchema).optional(),
  subscriptions: z.lazy(() => UserSubscriptionListRelationFilterSchema).optional(),
  blogPosts: z.lazy(() => BlogPostListRelationFilterSchema).optional()
}).strict();

export const UserOrderByWithRelationInputSchema: z.ZodType<Prisma.UserOrderByWithRelationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  email: z.lazy(() => SortOrderSchema).optional(),
  emailVerified: z.lazy(() => SortOrderSchema).optional(),
  image: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  username: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  role: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  banned: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  banReason: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  banExpires: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  onboardingComplete: z.lazy(() => SortOrderSchema).optional(),
  paymentsCustomerId: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  locale: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  membershipLevel: z.lazy(() => SortOrderSchema).optional(),
  sessions: z.lazy(() => SessionOrderByRelationAggregateInputSchema).optional(),
  accounts: z.lazy(() => AccountOrderByRelationAggregateInputSchema).optional(),
  passkeys: z.lazy(() => PasskeyOrderByRelationAggregateInputSchema).optional(),
  invitations: z.lazy(() => InvitationOrderByRelationAggregateInputSchema).optional(),
  purchases: z.lazy(() => PurchaseOrderByRelationAggregateInputSchema).optional(),
  memberships: z.lazy(() => MemberOrderByRelationAggregateInputSchema).optional(),
  aiChats: z.lazy(() => AiChatOrderByRelationAggregateInputSchema).optional(),
  subscriptions: z.lazy(() => UserSubscriptionOrderByRelationAggregateInputSchema).optional(),
  blogPosts: z.lazy(() => BlogPostOrderByRelationAggregateInputSchema).optional()
}).strict();

export const UserWhereUniqueInputSchema: z.ZodType<Prisma.UserWhereUniqueInput> = z.union([
  z.object({
    id: z.string().cuid(),
    email: z.string(),
    username: z.string()
  }),
  z.object({
    id: z.string().cuid(),
    email: z.string(),
  }),
  z.object({
    id: z.string().cuid(),
    username: z.string(),
  }),
  z.object({
    id: z.string().cuid(),
  }),
  z.object({
    email: z.string(),
    username: z.string(),
  }),
  z.object({
    email: z.string(),
  }),
  z.object({
    username: z.string(),
  }),
])
.and(z.object({
  id: z.string().cuid().optional(),
  email: z.string().optional(),
  username: z.string().optional(),
  AND: z.union([ z.lazy(() => UserWhereInputSchema),z.lazy(() => UserWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => UserWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UserWhereInputSchema),z.lazy(() => UserWhereInputSchema).array() ]).optional(),
  name: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  emailVerified: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  image: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  role: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  banned: z.union([ z.lazy(() => BoolNullableFilterSchema),z.boolean() ]).optional().nullable(),
  banReason: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  banExpires: z.union([ z.lazy(() => DateTimeNullableFilterSchema),z.coerce.date() ]).optional().nullable(),
  onboardingComplete: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  paymentsCustomerId: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  locale: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  membershipLevel: z.union([ z.lazy(() => EnumMembershipLevelFilterSchema),z.lazy(() => MembershipLevelSchema) ]).optional(),
  sessions: z.lazy(() => SessionListRelationFilterSchema).optional(),
  accounts: z.lazy(() => AccountListRelationFilterSchema).optional(),
  passkeys: z.lazy(() => PasskeyListRelationFilterSchema).optional(),
  invitations: z.lazy(() => InvitationListRelationFilterSchema).optional(),
  purchases: z.lazy(() => PurchaseListRelationFilterSchema).optional(),
  memberships: z.lazy(() => MemberListRelationFilterSchema).optional(),
  aiChats: z.lazy(() => AiChatListRelationFilterSchema).optional(),
  subscriptions: z.lazy(() => UserSubscriptionListRelationFilterSchema).optional(),
  blogPosts: z.lazy(() => BlogPostListRelationFilterSchema).optional()
}).strict());

export const UserOrderByWithAggregationInputSchema: z.ZodType<Prisma.UserOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  email: z.lazy(() => SortOrderSchema).optional(),
  emailVerified: z.lazy(() => SortOrderSchema).optional(),
  image: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  username: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  role: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  banned: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  banReason: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  banExpires: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  onboardingComplete: z.lazy(() => SortOrderSchema).optional(),
  paymentsCustomerId: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  locale: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  membershipLevel: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => UserCountOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => UserMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => UserMinOrderByAggregateInputSchema).optional()
}).strict();

export const UserScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.UserScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => UserScalarWhereWithAggregatesInputSchema),z.lazy(() => UserScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => UserScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UserScalarWhereWithAggregatesInputSchema),z.lazy(() => UserScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  name: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  email: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  emailVerified: z.union([ z.lazy(() => BoolWithAggregatesFilterSchema),z.boolean() ]).optional(),
  image: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  createdAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
  username: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  role: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  banned: z.union([ z.lazy(() => BoolNullableWithAggregatesFilterSchema),z.boolean() ]).optional().nullable(),
  banReason: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  banExpires: z.union([ z.lazy(() => DateTimeNullableWithAggregatesFilterSchema),z.coerce.date() ]).optional().nullable(),
  onboardingComplete: z.union([ z.lazy(() => BoolWithAggregatesFilterSchema),z.boolean() ]).optional(),
  paymentsCustomerId: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  locale: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  membershipLevel: z.union([ z.lazy(() => EnumMembershipLevelWithAggregatesFilterSchema),z.lazy(() => MembershipLevelSchema) ]).optional(),
}).strict();

export const SessionWhereInputSchema: z.ZodType<Prisma.SessionWhereInput> = z.object({
  AND: z.union([ z.lazy(() => SessionWhereInputSchema),z.lazy(() => SessionWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => SessionWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => SessionWhereInputSchema),z.lazy(() => SessionWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  expiresAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  ipAddress: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  userAgent: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  userId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  impersonatedBy: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  activeOrganizationId: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  token: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  user: z.union([ z.lazy(() => UserScalarRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional(),
}).strict();

export const SessionOrderByWithRelationInputSchema: z.ZodType<Prisma.SessionOrderByWithRelationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  expiresAt: z.lazy(() => SortOrderSchema).optional(),
  ipAddress: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  userAgent: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  impersonatedBy: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  activeOrganizationId: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  token: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  user: z.lazy(() => UserOrderByWithRelationInputSchema).optional()
}).strict();

export const SessionWhereUniqueInputSchema: z.ZodType<Prisma.SessionWhereUniqueInput> = z.union([
  z.object({
    id: z.string().cuid(),
    token: z.string()
  }),
  z.object({
    id: z.string().cuid(),
  }),
  z.object({
    token: z.string(),
  }),
])
.and(z.object({
  id: z.string().cuid().optional(),
  token: z.string().optional(),
  AND: z.union([ z.lazy(() => SessionWhereInputSchema),z.lazy(() => SessionWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => SessionWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => SessionWhereInputSchema),z.lazy(() => SessionWhereInputSchema).array() ]).optional(),
  expiresAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  ipAddress: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  userAgent: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  userId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  impersonatedBy: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  activeOrganizationId: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  user: z.union([ z.lazy(() => UserScalarRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional(),
}).strict());

export const SessionOrderByWithAggregationInputSchema: z.ZodType<Prisma.SessionOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  expiresAt: z.lazy(() => SortOrderSchema).optional(),
  ipAddress: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  userAgent: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  impersonatedBy: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  activeOrganizationId: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  token: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => SessionCountOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => SessionMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => SessionMinOrderByAggregateInputSchema).optional()
}).strict();

export const SessionScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.SessionScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => SessionScalarWhereWithAggregatesInputSchema),z.lazy(() => SessionScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => SessionScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => SessionScalarWhereWithAggregatesInputSchema),z.lazy(() => SessionScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  expiresAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
  ipAddress: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  userAgent: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  userId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  impersonatedBy: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  activeOrganizationId: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  token: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
}).strict();

export const AccountWhereInputSchema: z.ZodType<Prisma.AccountWhereInput> = z.object({
  AND: z.union([ z.lazy(() => AccountWhereInputSchema),z.lazy(() => AccountWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => AccountWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => AccountWhereInputSchema),z.lazy(() => AccountWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  accountId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  providerId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  accessToken: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  refreshToken: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  idToken: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  expiresAt: z.union([ z.lazy(() => DateTimeNullableFilterSchema),z.coerce.date() ]).optional().nullable(),
  password: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  accessTokenExpiresAt: z.union([ z.lazy(() => DateTimeNullableFilterSchema),z.coerce.date() ]).optional().nullable(),
  refreshTokenExpiresAt: z.union([ z.lazy(() => DateTimeNullableFilterSchema),z.coerce.date() ]).optional().nullable(),
  scope: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  user: z.union([ z.lazy(() => UserScalarRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional(),
}).strict();

export const AccountOrderByWithRelationInputSchema: z.ZodType<Prisma.AccountOrderByWithRelationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  accountId: z.lazy(() => SortOrderSchema).optional(),
  providerId: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  accessToken: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  refreshToken: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  idToken: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  expiresAt: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  password: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  accessTokenExpiresAt: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  refreshTokenExpiresAt: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  scope: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  user: z.lazy(() => UserOrderByWithRelationInputSchema).optional()
}).strict();

export const AccountWhereUniqueInputSchema: z.ZodType<Prisma.AccountWhereUniqueInput> = z.object({
  id: z.string().cuid()
})
.and(z.object({
  id: z.string().cuid().optional(),
  AND: z.union([ z.lazy(() => AccountWhereInputSchema),z.lazy(() => AccountWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => AccountWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => AccountWhereInputSchema),z.lazy(() => AccountWhereInputSchema).array() ]).optional(),
  accountId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  providerId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  accessToken: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  refreshToken: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  idToken: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  expiresAt: z.union([ z.lazy(() => DateTimeNullableFilterSchema),z.coerce.date() ]).optional().nullable(),
  password: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  accessTokenExpiresAt: z.union([ z.lazy(() => DateTimeNullableFilterSchema),z.coerce.date() ]).optional().nullable(),
  refreshTokenExpiresAt: z.union([ z.lazy(() => DateTimeNullableFilterSchema),z.coerce.date() ]).optional().nullable(),
  scope: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  user: z.union([ z.lazy(() => UserScalarRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional(),
}).strict());

export const AccountOrderByWithAggregationInputSchema: z.ZodType<Prisma.AccountOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  accountId: z.lazy(() => SortOrderSchema).optional(),
  providerId: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  accessToken: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  refreshToken: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  idToken: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  expiresAt: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  password: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  accessTokenExpiresAt: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  refreshTokenExpiresAt: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  scope: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => AccountCountOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => AccountMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => AccountMinOrderByAggregateInputSchema).optional()
}).strict();

export const AccountScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.AccountScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => AccountScalarWhereWithAggregatesInputSchema),z.lazy(() => AccountScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => AccountScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => AccountScalarWhereWithAggregatesInputSchema),z.lazy(() => AccountScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  accountId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  providerId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  accessToken: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  refreshToken: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  idToken: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  expiresAt: z.union([ z.lazy(() => DateTimeNullableWithAggregatesFilterSchema),z.coerce.date() ]).optional().nullable(),
  password: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  accessTokenExpiresAt: z.union([ z.lazy(() => DateTimeNullableWithAggregatesFilterSchema),z.coerce.date() ]).optional().nullable(),
  refreshTokenExpiresAt: z.union([ z.lazy(() => DateTimeNullableWithAggregatesFilterSchema),z.coerce.date() ]).optional().nullable(),
  scope: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  createdAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
}).strict();

export const VerificationWhereInputSchema: z.ZodType<Prisma.VerificationWhereInput> = z.object({
  AND: z.union([ z.lazy(() => VerificationWhereInputSchema),z.lazy(() => VerificationWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => VerificationWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => VerificationWhereInputSchema),z.lazy(() => VerificationWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  identifier: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  value: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  expiresAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeNullableFilterSchema),z.coerce.date() ]).optional().nullable(),
  updatedAt: z.union([ z.lazy(() => DateTimeNullableFilterSchema),z.coerce.date() ]).optional().nullable(),
}).strict();

export const VerificationOrderByWithRelationInputSchema: z.ZodType<Prisma.VerificationOrderByWithRelationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  identifier: z.lazy(() => SortOrderSchema).optional(),
  value: z.lazy(() => SortOrderSchema).optional(),
  expiresAt: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  updatedAt: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
}).strict();

export const VerificationWhereUniqueInputSchema: z.ZodType<Prisma.VerificationWhereUniqueInput> = z.object({
  id: z.string().cuid()
})
.and(z.object({
  id: z.string().cuid().optional(),
  AND: z.union([ z.lazy(() => VerificationWhereInputSchema),z.lazy(() => VerificationWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => VerificationWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => VerificationWhereInputSchema),z.lazy(() => VerificationWhereInputSchema).array() ]).optional(),
  identifier: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  value: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  expiresAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeNullableFilterSchema),z.coerce.date() ]).optional().nullable(),
  updatedAt: z.union([ z.lazy(() => DateTimeNullableFilterSchema),z.coerce.date() ]).optional().nullable(),
}).strict());

export const VerificationOrderByWithAggregationInputSchema: z.ZodType<Prisma.VerificationOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  identifier: z.lazy(() => SortOrderSchema).optional(),
  value: z.lazy(() => SortOrderSchema).optional(),
  expiresAt: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  updatedAt: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  _count: z.lazy(() => VerificationCountOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => VerificationMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => VerificationMinOrderByAggregateInputSchema).optional()
}).strict();

export const VerificationScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.VerificationScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => VerificationScalarWhereWithAggregatesInputSchema),z.lazy(() => VerificationScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => VerificationScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => VerificationScalarWhereWithAggregatesInputSchema),z.lazy(() => VerificationScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  identifier: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  value: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  expiresAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeNullableWithAggregatesFilterSchema),z.coerce.date() ]).optional().nullable(),
  updatedAt: z.union([ z.lazy(() => DateTimeNullableWithAggregatesFilterSchema),z.coerce.date() ]).optional().nullable(),
}).strict();

export const PasskeyWhereInputSchema: z.ZodType<Prisma.PasskeyWhereInput> = z.object({
  AND: z.union([ z.lazy(() => PasskeyWhereInputSchema),z.lazy(() => PasskeyWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => PasskeyWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => PasskeyWhereInputSchema),z.lazy(() => PasskeyWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  name: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  publicKey: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  credentialID: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  counter: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  deviceType: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  backedUp: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  transports: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  createdAt: z.union([ z.lazy(() => DateTimeNullableFilterSchema),z.coerce.date() ]).optional().nullable(),
  user: z.union([ z.lazy(() => UserScalarRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional(),
}).strict();

export const PasskeyOrderByWithRelationInputSchema: z.ZodType<Prisma.PasskeyOrderByWithRelationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  publicKey: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  credentialID: z.lazy(() => SortOrderSchema).optional(),
  counter: z.lazy(() => SortOrderSchema).optional(),
  deviceType: z.lazy(() => SortOrderSchema).optional(),
  backedUp: z.lazy(() => SortOrderSchema).optional(),
  transports: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  createdAt: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  user: z.lazy(() => UserOrderByWithRelationInputSchema).optional()
}).strict();

export const PasskeyWhereUniqueInputSchema: z.ZodType<Prisma.PasskeyWhereUniqueInput> = z.object({
  id: z.string().cuid()
})
.and(z.object({
  id: z.string().cuid().optional(),
  AND: z.union([ z.lazy(() => PasskeyWhereInputSchema),z.lazy(() => PasskeyWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => PasskeyWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => PasskeyWhereInputSchema),z.lazy(() => PasskeyWhereInputSchema).array() ]).optional(),
  name: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  publicKey: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  credentialID: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  counter: z.union([ z.lazy(() => IntFilterSchema),z.number().int() ]).optional(),
  deviceType: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  backedUp: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  transports: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  createdAt: z.union([ z.lazy(() => DateTimeNullableFilterSchema),z.coerce.date() ]).optional().nullable(),
  user: z.union([ z.lazy(() => UserScalarRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional(),
}).strict());

export const PasskeyOrderByWithAggregationInputSchema: z.ZodType<Prisma.PasskeyOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  publicKey: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  credentialID: z.lazy(() => SortOrderSchema).optional(),
  counter: z.lazy(() => SortOrderSchema).optional(),
  deviceType: z.lazy(() => SortOrderSchema).optional(),
  backedUp: z.lazy(() => SortOrderSchema).optional(),
  transports: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  createdAt: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  _count: z.lazy(() => PasskeyCountOrderByAggregateInputSchema).optional(),
  _avg: z.lazy(() => PasskeyAvgOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => PasskeyMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => PasskeyMinOrderByAggregateInputSchema).optional(),
  _sum: z.lazy(() => PasskeySumOrderByAggregateInputSchema).optional()
}).strict();

export const PasskeyScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.PasskeyScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => PasskeyScalarWhereWithAggregatesInputSchema),z.lazy(() => PasskeyScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => PasskeyScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => PasskeyScalarWhereWithAggregatesInputSchema),z.lazy(() => PasskeyScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  name: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  publicKey: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  credentialID: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  counter: z.union([ z.lazy(() => IntWithAggregatesFilterSchema),z.number() ]).optional(),
  deviceType: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  backedUp: z.union([ z.lazy(() => BoolWithAggregatesFilterSchema),z.boolean() ]).optional(),
  transports: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  createdAt: z.union([ z.lazy(() => DateTimeNullableWithAggregatesFilterSchema),z.coerce.date() ]).optional().nullable(),
}).strict();

export const OrganizationWhereInputSchema: z.ZodType<Prisma.OrganizationWhereInput> = z.object({
  AND: z.union([ z.lazy(() => OrganizationWhereInputSchema),z.lazy(() => OrganizationWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => OrganizationWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => OrganizationWhereInputSchema),z.lazy(() => OrganizationWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  name: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  slug: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  logo: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  metadata: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  paymentsCustomerId: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  members: z.lazy(() => MemberListRelationFilterSchema).optional(),
  invitations: z.lazy(() => InvitationListRelationFilterSchema).optional(),
  purchases: z.lazy(() => PurchaseListRelationFilterSchema).optional(),
  aiChats: z.lazy(() => AiChatListRelationFilterSchema).optional()
}).strict();

export const OrganizationOrderByWithRelationInputSchema: z.ZodType<Prisma.OrganizationOrderByWithRelationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  slug: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  logo: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  metadata: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  paymentsCustomerId: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  members: z.lazy(() => MemberOrderByRelationAggregateInputSchema).optional(),
  invitations: z.lazy(() => InvitationOrderByRelationAggregateInputSchema).optional(),
  purchases: z.lazy(() => PurchaseOrderByRelationAggregateInputSchema).optional(),
  aiChats: z.lazy(() => AiChatOrderByRelationAggregateInputSchema).optional()
}).strict();

export const OrganizationWhereUniqueInputSchema: z.ZodType<Prisma.OrganizationWhereUniqueInput> = z.union([
  z.object({
    id: z.string().cuid(),
    slug: z.string()
  }),
  z.object({
    id: z.string().cuid(),
  }),
  z.object({
    slug: z.string(),
  }),
])
.and(z.object({
  id: z.string().cuid().optional(),
  slug: z.string().optional(),
  AND: z.union([ z.lazy(() => OrganizationWhereInputSchema),z.lazy(() => OrganizationWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => OrganizationWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => OrganizationWhereInputSchema),z.lazy(() => OrganizationWhereInputSchema).array() ]).optional(),
  name: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  logo: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  metadata: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  paymentsCustomerId: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  members: z.lazy(() => MemberListRelationFilterSchema).optional(),
  invitations: z.lazy(() => InvitationListRelationFilterSchema).optional(),
  purchases: z.lazy(() => PurchaseListRelationFilterSchema).optional(),
  aiChats: z.lazy(() => AiChatListRelationFilterSchema).optional()
}).strict());

export const OrganizationOrderByWithAggregationInputSchema: z.ZodType<Prisma.OrganizationOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  slug: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  logo: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  metadata: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  paymentsCustomerId: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  _count: z.lazy(() => OrganizationCountOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => OrganizationMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => OrganizationMinOrderByAggregateInputSchema).optional()
}).strict();

export const OrganizationScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.OrganizationScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => OrganizationScalarWhereWithAggregatesInputSchema),z.lazy(() => OrganizationScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => OrganizationScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => OrganizationScalarWhereWithAggregatesInputSchema),z.lazy(() => OrganizationScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  name: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  slug: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  logo: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  createdAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
  metadata: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  paymentsCustomerId: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
}).strict();

export const MemberWhereInputSchema: z.ZodType<Prisma.MemberWhereInput> = z.object({
  AND: z.union([ z.lazy(() => MemberWhereInputSchema),z.lazy(() => MemberWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => MemberWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => MemberWhereInputSchema),z.lazy(() => MemberWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  organizationId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  role: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  organization: z.union([ z.lazy(() => OrganizationScalarRelationFilterSchema),z.lazy(() => OrganizationWhereInputSchema) ]).optional(),
  user: z.union([ z.lazy(() => UserScalarRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional(),
}).strict();

export const MemberOrderByWithRelationInputSchema: z.ZodType<Prisma.MemberOrderByWithRelationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  organizationId: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  role: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  organization: z.lazy(() => OrganizationOrderByWithRelationInputSchema).optional(),
  user: z.lazy(() => UserOrderByWithRelationInputSchema).optional()
}).strict();

export const MemberWhereUniqueInputSchema: z.ZodType<Prisma.MemberWhereUniqueInput> = z.union([
  z.object({
    id: z.string().cuid(),
    organizationId_userId: z.lazy(() => MemberOrganizationIdUserIdCompoundUniqueInputSchema)
  }),
  z.object({
    id: z.string().cuid(),
  }),
  z.object({
    organizationId_userId: z.lazy(() => MemberOrganizationIdUserIdCompoundUniqueInputSchema),
  }),
])
.and(z.object({
  id: z.string().cuid().optional(),
  organizationId_userId: z.lazy(() => MemberOrganizationIdUserIdCompoundUniqueInputSchema).optional(),
  AND: z.union([ z.lazy(() => MemberWhereInputSchema),z.lazy(() => MemberWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => MemberWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => MemberWhereInputSchema),z.lazy(() => MemberWhereInputSchema).array() ]).optional(),
  organizationId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  role: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  organization: z.union([ z.lazy(() => OrganizationScalarRelationFilterSchema),z.lazy(() => OrganizationWhereInputSchema) ]).optional(),
  user: z.union([ z.lazy(() => UserScalarRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional(),
}).strict());

export const MemberOrderByWithAggregationInputSchema: z.ZodType<Prisma.MemberOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  organizationId: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  role: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => MemberCountOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => MemberMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => MemberMinOrderByAggregateInputSchema).optional()
}).strict();

export const MemberScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.MemberScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => MemberScalarWhereWithAggregatesInputSchema),z.lazy(() => MemberScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => MemberScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => MemberScalarWhereWithAggregatesInputSchema),z.lazy(() => MemberScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  organizationId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  role: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
}).strict();

export const InvitationWhereInputSchema: z.ZodType<Prisma.InvitationWhereInput> = z.object({
  AND: z.union([ z.lazy(() => InvitationWhereInputSchema),z.lazy(() => InvitationWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => InvitationWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => InvitationWhereInputSchema),z.lazy(() => InvitationWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  organizationId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  email: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  role: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  status: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  expiresAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  inviterId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  organization: z.union([ z.lazy(() => OrganizationScalarRelationFilterSchema),z.lazy(() => OrganizationWhereInputSchema) ]).optional(),
  user: z.union([ z.lazy(() => UserScalarRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional(),
}).strict();

export const InvitationOrderByWithRelationInputSchema: z.ZodType<Prisma.InvitationOrderByWithRelationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  organizationId: z.lazy(() => SortOrderSchema).optional(),
  email: z.lazy(() => SortOrderSchema).optional(),
  role: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  expiresAt: z.lazy(() => SortOrderSchema).optional(),
  inviterId: z.lazy(() => SortOrderSchema).optional(),
  organization: z.lazy(() => OrganizationOrderByWithRelationInputSchema).optional(),
  user: z.lazy(() => UserOrderByWithRelationInputSchema).optional()
}).strict();

export const InvitationWhereUniqueInputSchema: z.ZodType<Prisma.InvitationWhereUniqueInput> = z.object({
  id: z.string().cuid()
})
.and(z.object({
  id: z.string().cuid().optional(),
  AND: z.union([ z.lazy(() => InvitationWhereInputSchema),z.lazy(() => InvitationWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => InvitationWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => InvitationWhereInputSchema),z.lazy(() => InvitationWhereInputSchema).array() ]).optional(),
  organizationId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  email: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  role: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  status: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  expiresAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  inviterId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  organization: z.union([ z.lazy(() => OrganizationScalarRelationFilterSchema),z.lazy(() => OrganizationWhereInputSchema) ]).optional(),
  user: z.union([ z.lazy(() => UserScalarRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional(),
}).strict());

export const InvitationOrderByWithAggregationInputSchema: z.ZodType<Prisma.InvitationOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  organizationId: z.lazy(() => SortOrderSchema).optional(),
  email: z.lazy(() => SortOrderSchema).optional(),
  role: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  expiresAt: z.lazy(() => SortOrderSchema).optional(),
  inviterId: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => InvitationCountOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => InvitationMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => InvitationMinOrderByAggregateInputSchema).optional()
}).strict();

export const InvitationScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.InvitationScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => InvitationScalarWhereWithAggregatesInputSchema),z.lazy(() => InvitationScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => InvitationScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => InvitationScalarWhereWithAggregatesInputSchema),z.lazy(() => InvitationScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  organizationId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  email: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  role: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  status: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  expiresAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
  inviterId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
}).strict();

export const PurchaseWhereInputSchema: z.ZodType<Prisma.PurchaseWhereInput> = z.object({
  AND: z.union([ z.lazy(() => PurchaseWhereInputSchema),z.lazy(() => PurchaseWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => PurchaseWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => PurchaseWhereInputSchema),z.lazy(() => PurchaseWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  organizationId: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  userId: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  type: z.union([ z.lazy(() => EnumPurchaseTypeFilterSchema),z.lazy(() => PurchaseTypeSchema) ]).optional(),
  customerId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  subscriptionId: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  productId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  status: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  organization: z.union([ z.lazy(() => OrganizationNullableScalarRelationFilterSchema),z.lazy(() => OrganizationWhereInputSchema) ]).optional().nullable(),
  user: z.union([ z.lazy(() => UserNullableScalarRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional().nullable(),
}).strict();

export const PurchaseOrderByWithRelationInputSchema: z.ZodType<Prisma.PurchaseOrderByWithRelationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  organizationId: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  userId: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  type: z.lazy(() => SortOrderSchema).optional(),
  customerId: z.lazy(() => SortOrderSchema).optional(),
  subscriptionId: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  productId: z.lazy(() => SortOrderSchema).optional(),
  status: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  organization: z.lazy(() => OrganizationOrderByWithRelationInputSchema).optional(),
  user: z.lazy(() => UserOrderByWithRelationInputSchema).optional()
}).strict();

export const PurchaseWhereUniqueInputSchema: z.ZodType<Prisma.PurchaseWhereUniqueInput> = z.union([
  z.object({
    id: z.string().cuid(),
    subscriptionId: z.string()
  }),
  z.object({
    id: z.string().cuid(),
  }),
  z.object({
    subscriptionId: z.string(),
  }),
])
.and(z.object({
  id: z.string().cuid().optional(),
  subscriptionId: z.string().optional(),
  AND: z.union([ z.lazy(() => PurchaseWhereInputSchema),z.lazy(() => PurchaseWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => PurchaseWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => PurchaseWhereInputSchema),z.lazy(() => PurchaseWhereInputSchema).array() ]).optional(),
  organizationId: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  userId: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  type: z.union([ z.lazy(() => EnumPurchaseTypeFilterSchema),z.lazy(() => PurchaseTypeSchema) ]).optional(),
  customerId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  productId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  status: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  organization: z.union([ z.lazy(() => OrganizationNullableScalarRelationFilterSchema),z.lazy(() => OrganizationWhereInputSchema) ]).optional().nullable(),
  user: z.union([ z.lazy(() => UserNullableScalarRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional().nullable(),
}).strict());

export const PurchaseOrderByWithAggregationInputSchema: z.ZodType<Prisma.PurchaseOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  organizationId: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  userId: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  type: z.lazy(() => SortOrderSchema).optional(),
  customerId: z.lazy(() => SortOrderSchema).optional(),
  subscriptionId: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  productId: z.lazy(() => SortOrderSchema).optional(),
  status: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => PurchaseCountOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => PurchaseMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => PurchaseMinOrderByAggregateInputSchema).optional()
}).strict();

export const PurchaseScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.PurchaseScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => PurchaseScalarWhereWithAggregatesInputSchema),z.lazy(() => PurchaseScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => PurchaseScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => PurchaseScalarWhereWithAggregatesInputSchema),z.lazy(() => PurchaseScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  organizationId: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  userId: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  type: z.union([ z.lazy(() => EnumPurchaseTypeWithAggregatesFilterSchema),z.lazy(() => PurchaseTypeSchema) ]).optional(),
  customerId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  subscriptionId: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  productId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  status: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  createdAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
}).strict();

export const AiChatWhereInputSchema: z.ZodType<Prisma.AiChatWhereInput> = z.object({
  AND: z.union([ z.lazy(() => AiChatWhereInputSchema),z.lazy(() => AiChatWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => AiChatWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => AiChatWhereInputSchema),z.lazy(() => AiChatWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  organizationId: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  userId: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  title: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  messages: z.lazy(() => JsonFilterSchema).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  organization: z.union([ z.lazy(() => OrganizationNullableScalarRelationFilterSchema),z.lazy(() => OrganizationWhereInputSchema) ]).optional().nullable(),
  user: z.union([ z.lazy(() => UserNullableScalarRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional().nullable(),
}).strict();

export const AiChatOrderByWithRelationInputSchema: z.ZodType<Prisma.AiChatOrderByWithRelationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  organizationId: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  userId: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  title: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  messages: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  organization: z.lazy(() => OrganizationOrderByWithRelationInputSchema).optional(),
  user: z.lazy(() => UserOrderByWithRelationInputSchema).optional()
}).strict();

export const AiChatWhereUniqueInputSchema: z.ZodType<Prisma.AiChatWhereUniqueInput> = z.object({
  id: z.string().cuid()
})
.and(z.object({
  id: z.string().cuid().optional(),
  AND: z.union([ z.lazy(() => AiChatWhereInputSchema),z.lazy(() => AiChatWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => AiChatWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => AiChatWhereInputSchema),z.lazy(() => AiChatWhereInputSchema).array() ]).optional(),
  organizationId: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  userId: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  title: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  messages: z.lazy(() => JsonFilterSchema).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  organization: z.union([ z.lazy(() => OrganizationNullableScalarRelationFilterSchema),z.lazy(() => OrganizationWhereInputSchema) ]).optional().nullable(),
  user: z.union([ z.lazy(() => UserNullableScalarRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional().nullable(),
}).strict());

export const AiChatOrderByWithAggregationInputSchema: z.ZodType<Prisma.AiChatOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  organizationId: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  userId: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  title: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  messages: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => AiChatCountOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => AiChatMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => AiChatMinOrderByAggregateInputSchema).optional()
}).strict();

export const AiChatScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.AiChatScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => AiChatScalarWhereWithAggregatesInputSchema),z.lazy(() => AiChatScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => AiChatScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => AiChatScalarWhereWithAggregatesInputSchema),z.lazy(() => AiChatScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  organizationId: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  userId: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  title: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  messages: z.lazy(() => JsonWithAggregatesFilterSchema).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
}).strict();

export const BlogPostWhereInputSchema: z.ZodType<Prisma.BlogPostWhereInput> = z.object({
  AND: z.union([ z.lazy(() => BlogPostWhereInputSchema),z.lazy(() => BlogPostWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => BlogPostWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => BlogPostWhereInputSchema),z.lazy(() => BlogPostWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  slug: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  title: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  excerpt: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  content: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  image: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  authorId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  accessLevel: z.union([ z.lazy(() => EnumAccessLevelFilterSchema),z.lazy(() => AccessLevelSchema) ]).optional(),
  previewContent: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  tags: z.lazy(() => StringNullableListFilterSchema).optional(),
  published: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  publishedAt: z.union([ z.lazy(() => DateTimeNullableFilterSchema),z.coerce.date() ]).optional().nullable(),
  viewCount: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  author: z.union([ z.lazy(() => UserScalarRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional(),
  categories: z.lazy(() => BlogCategoryListRelationFilterSchema).optional()
}).strict();

export const BlogPostOrderByWithRelationInputSchema: z.ZodType<Prisma.BlogPostOrderByWithRelationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  slug: z.lazy(() => SortOrderSchema).optional(),
  title: z.lazy(() => SortOrderSchema).optional(),
  excerpt: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  content: z.lazy(() => SortOrderSchema).optional(),
  image: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  authorId: z.lazy(() => SortOrderSchema).optional(),
  accessLevel: z.lazy(() => SortOrderSchema).optional(),
  previewContent: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  tags: z.lazy(() => SortOrderSchema).optional(),
  published: z.lazy(() => SortOrderSchema).optional(),
  publishedAt: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  viewCount: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  author: z.lazy(() => UserOrderByWithRelationInputSchema).optional(),
  categories: z.lazy(() => BlogCategoryOrderByRelationAggregateInputSchema).optional()
}).strict();

export const BlogPostWhereUniqueInputSchema: z.ZodType<Prisma.BlogPostWhereUniqueInput> = z.union([
  z.object({
    id: z.string().cuid(),
    slug: z.string()
  }),
  z.object({
    id: z.string().cuid(),
  }),
  z.object({
    slug: z.string(),
  }),
])
.and(z.object({
  id: z.string().cuid().optional(),
  slug: z.string().optional(),
  AND: z.union([ z.lazy(() => BlogPostWhereInputSchema),z.lazy(() => BlogPostWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => BlogPostWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => BlogPostWhereInputSchema),z.lazy(() => BlogPostWhereInputSchema).array() ]).optional(),
  title: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  excerpt: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  content: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  image: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  authorId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  accessLevel: z.union([ z.lazy(() => EnumAccessLevelFilterSchema),z.lazy(() => AccessLevelSchema) ]).optional(),
  previewContent: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  tags: z.lazy(() => StringNullableListFilterSchema).optional(),
  published: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  publishedAt: z.union([ z.lazy(() => DateTimeNullableFilterSchema),z.coerce.date() ]).optional().nullable(),
  viewCount: z.union([ z.lazy(() => IntFilterSchema),z.number().int() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  author: z.union([ z.lazy(() => UserScalarRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional(),
  categories: z.lazy(() => BlogCategoryListRelationFilterSchema).optional()
}).strict());

export const BlogPostOrderByWithAggregationInputSchema: z.ZodType<Prisma.BlogPostOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  slug: z.lazy(() => SortOrderSchema).optional(),
  title: z.lazy(() => SortOrderSchema).optional(),
  excerpt: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  content: z.lazy(() => SortOrderSchema).optional(),
  image: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  authorId: z.lazy(() => SortOrderSchema).optional(),
  accessLevel: z.lazy(() => SortOrderSchema).optional(),
  previewContent: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  tags: z.lazy(() => SortOrderSchema).optional(),
  published: z.lazy(() => SortOrderSchema).optional(),
  publishedAt: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  viewCount: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => BlogPostCountOrderByAggregateInputSchema).optional(),
  _avg: z.lazy(() => BlogPostAvgOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => BlogPostMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => BlogPostMinOrderByAggregateInputSchema).optional(),
  _sum: z.lazy(() => BlogPostSumOrderByAggregateInputSchema).optional()
}).strict();

export const BlogPostScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.BlogPostScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => BlogPostScalarWhereWithAggregatesInputSchema),z.lazy(() => BlogPostScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => BlogPostScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => BlogPostScalarWhereWithAggregatesInputSchema),z.lazy(() => BlogPostScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  slug: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  title: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  excerpt: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  content: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  image: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  authorId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  accessLevel: z.union([ z.lazy(() => EnumAccessLevelWithAggregatesFilterSchema),z.lazy(() => AccessLevelSchema) ]).optional(),
  previewContent: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  tags: z.lazy(() => StringNullableListFilterSchema).optional(),
  published: z.union([ z.lazy(() => BoolWithAggregatesFilterSchema),z.boolean() ]).optional(),
  publishedAt: z.union([ z.lazy(() => DateTimeNullableWithAggregatesFilterSchema),z.coerce.date() ]).optional().nullable(),
  viewCount: z.union([ z.lazy(() => IntWithAggregatesFilterSchema),z.number() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
}).strict();

export const SubscriptionPlanWhereInputSchema: z.ZodType<Prisma.SubscriptionPlanWhereInput> = z.object({
  AND: z.union([ z.lazy(() => SubscriptionPlanWhereInputSchema),z.lazy(() => SubscriptionPlanWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => SubscriptionPlanWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => SubscriptionPlanWhereInputSchema),z.lazy(() => SubscriptionPlanWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  name: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  slug: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  description: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  price: z.union([ z.lazy(() => DecimalFilterSchema),z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional(),
  currency: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  interval: z.union([ z.lazy(() => EnumPlanIntervalFilterSchema),z.lazy(() => PlanIntervalSchema) ]).optional(),
  intervalCount: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  features: z.lazy(() => JsonFilterSchema).optional(),
  active: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  subscriptions: z.lazy(() => UserSubscriptionListRelationFilterSchema).optional()
}).strict();

export const SubscriptionPlanOrderByWithRelationInputSchema: z.ZodType<Prisma.SubscriptionPlanOrderByWithRelationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  slug: z.lazy(() => SortOrderSchema).optional(),
  description: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  price: z.lazy(() => SortOrderSchema).optional(),
  currency: z.lazy(() => SortOrderSchema).optional(),
  interval: z.lazy(() => SortOrderSchema).optional(),
  intervalCount: z.lazy(() => SortOrderSchema).optional(),
  features: z.lazy(() => SortOrderSchema).optional(),
  active: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  subscriptions: z.lazy(() => UserSubscriptionOrderByRelationAggregateInputSchema).optional()
}).strict();

export const SubscriptionPlanWhereUniqueInputSchema: z.ZodType<Prisma.SubscriptionPlanWhereUniqueInput> = z.union([
  z.object({
    id: z.string().cuid(),
    slug: z.string()
  }),
  z.object({
    id: z.string().cuid(),
  }),
  z.object({
    slug: z.string(),
  }),
])
.and(z.object({
  id: z.string().cuid().optional(),
  slug: z.string().optional(),
  AND: z.union([ z.lazy(() => SubscriptionPlanWhereInputSchema),z.lazy(() => SubscriptionPlanWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => SubscriptionPlanWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => SubscriptionPlanWhereInputSchema),z.lazy(() => SubscriptionPlanWhereInputSchema).array() ]).optional(),
  name: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  description: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  price: z.union([ z.lazy(() => DecimalFilterSchema),z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional(),
  currency: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  interval: z.union([ z.lazy(() => EnumPlanIntervalFilterSchema),z.lazy(() => PlanIntervalSchema) ]).optional(),
  intervalCount: z.union([ z.lazy(() => IntFilterSchema),z.number().int() ]).optional(),
  features: z.lazy(() => JsonFilterSchema).optional(),
  active: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  subscriptions: z.lazy(() => UserSubscriptionListRelationFilterSchema).optional()
}).strict());

export const SubscriptionPlanOrderByWithAggregationInputSchema: z.ZodType<Prisma.SubscriptionPlanOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  slug: z.lazy(() => SortOrderSchema).optional(),
  description: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  price: z.lazy(() => SortOrderSchema).optional(),
  currency: z.lazy(() => SortOrderSchema).optional(),
  interval: z.lazy(() => SortOrderSchema).optional(),
  intervalCount: z.lazy(() => SortOrderSchema).optional(),
  features: z.lazy(() => SortOrderSchema).optional(),
  active: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => SubscriptionPlanCountOrderByAggregateInputSchema).optional(),
  _avg: z.lazy(() => SubscriptionPlanAvgOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => SubscriptionPlanMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => SubscriptionPlanMinOrderByAggregateInputSchema).optional(),
  _sum: z.lazy(() => SubscriptionPlanSumOrderByAggregateInputSchema).optional()
}).strict();

export const SubscriptionPlanScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.SubscriptionPlanScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => SubscriptionPlanScalarWhereWithAggregatesInputSchema),z.lazy(() => SubscriptionPlanScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => SubscriptionPlanScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => SubscriptionPlanScalarWhereWithAggregatesInputSchema),z.lazy(() => SubscriptionPlanScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  name: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  slug: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  description: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  price: z.union([ z.lazy(() => DecimalWithAggregatesFilterSchema),z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional(),
  currency: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  interval: z.union([ z.lazy(() => EnumPlanIntervalWithAggregatesFilterSchema),z.lazy(() => PlanIntervalSchema) ]).optional(),
  intervalCount: z.union([ z.lazy(() => IntWithAggregatesFilterSchema),z.number() ]).optional(),
  features: z.lazy(() => JsonWithAggregatesFilterSchema).optional(),
  active: z.union([ z.lazy(() => BoolWithAggregatesFilterSchema),z.boolean() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
}).strict();

export const UserSubscriptionWhereInputSchema: z.ZodType<Prisma.UserSubscriptionWhereInput> = z.object({
  AND: z.union([ z.lazy(() => UserSubscriptionWhereInputSchema),z.lazy(() => UserSubscriptionWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => UserSubscriptionWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UserSubscriptionWhereInputSchema),z.lazy(() => UserSubscriptionWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  planId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  status: z.union([ z.lazy(() => EnumSubscriptionStatusFilterSchema),z.lazy(() => SubscriptionStatusSchema) ]).optional(),
  startDate: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  endDate: z.union([ z.lazy(() => DateTimeNullableFilterSchema),z.coerce.date() ]).optional().nullable(),
  cancelledAt: z.union([ z.lazy(() => DateTimeNullableFilterSchema),z.coerce.date() ]).optional().nullable(),
  paymentId: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  paymentMethod: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  amount: z.union([ z.lazy(() => DecimalFilterSchema),z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional(),
  autoRenew: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  nextBillingDate: z.union([ z.lazy(() => DateTimeNullableFilterSchema),z.coerce.date() ]).optional().nullable(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  user: z.union([ z.lazy(() => UserScalarRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional(),
  plan: z.union([ z.lazy(() => SubscriptionPlanScalarRelationFilterSchema),z.lazy(() => SubscriptionPlanWhereInputSchema) ]).optional(),
}).strict();

export const UserSubscriptionOrderByWithRelationInputSchema: z.ZodType<Prisma.UserSubscriptionOrderByWithRelationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  planId: z.lazy(() => SortOrderSchema).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  startDate: z.lazy(() => SortOrderSchema).optional(),
  endDate: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  cancelledAt: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  paymentId: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  paymentMethod: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  amount: z.lazy(() => SortOrderSchema).optional(),
  autoRenew: z.lazy(() => SortOrderSchema).optional(),
  nextBillingDate: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  user: z.lazy(() => UserOrderByWithRelationInputSchema).optional(),
  plan: z.lazy(() => SubscriptionPlanOrderByWithRelationInputSchema).optional()
}).strict();

export const UserSubscriptionWhereUniqueInputSchema: z.ZodType<Prisma.UserSubscriptionWhereUniqueInput> = z.union([
  z.object({
    id: z.string().cuid(),
    userId_planId_status: z.lazy(() => UserSubscriptionUserIdPlanIdStatusCompoundUniqueInputSchema)
  }),
  z.object({
    id: z.string().cuid(),
  }),
  z.object({
    userId_planId_status: z.lazy(() => UserSubscriptionUserIdPlanIdStatusCompoundUniqueInputSchema),
  }),
])
.and(z.object({
  id: z.string().cuid().optional(),
  userId_planId_status: z.lazy(() => UserSubscriptionUserIdPlanIdStatusCompoundUniqueInputSchema).optional(),
  AND: z.union([ z.lazy(() => UserSubscriptionWhereInputSchema),z.lazy(() => UserSubscriptionWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => UserSubscriptionWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UserSubscriptionWhereInputSchema),z.lazy(() => UserSubscriptionWhereInputSchema).array() ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  planId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  status: z.union([ z.lazy(() => EnumSubscriptionStatusFilterSchema),z.lazy(() => SubscriptionStatusSchema) ]).optional(),
  startDate: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  endDate: z.union([ z.lazy(() => DateTimeNullableFilterSchema),z.coerce.date() ]).optional().nullable(),
  cancelledAt: z.union([ z.lazy(() => DateTimeNullableFilterSchema),z.coerce.date() ]).optional().nullable(),
  paymentId: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  paymentMethod: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  amount: z.union([ z.lazy(() => DecimalFilterSchema),z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional(),
  autoRenew: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  nextBillingDate: z.union([ z.lazy(() => DateTimeNullableFilterSchema),z.coerce.date() ]).optional().nullable(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  user: z.union([ z.lazy(() => UserScalarRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional(),
  plan: z.union([ z.lazy(() => SubscriptionPlanScalarRelationFilterSchema),z.lazy(() => SubscriptionPlanWhereInputSchema) ]).optional(),
}).strict());

export const UserSubscriptionOrderByWithAggregationInputSchema: z.ZodType<Prisma.UserSubscriptionOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  planId: z.lazy(() => SortOrderSchema).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  startDate: z.lazy(() => SortOrderSchema).optional(),
  endDate: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  cancelledAt: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  paymentId: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  paymentMethod: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  amount: z.lazy(() => SortOrderSchema).optional(),
  autoRenew: z.lazy(() => SortOrderSchema).optional(),
  nextBillingDate: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => UserSubscriptionCountOrderByAggregateInputSchema).optional(),
  _avg: z.lazy(() => UserSubscriptionAvgOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => UserSubscriptionMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => UserSubscriptionMinOrderByAggregateInputSchema).optional(),
  _sum: z.lazy(() => UserSubscriptionSumOrderByAggregateInputSchema).optional()
}).strict();

export const UserSubscriptionScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.UserSubscriptionScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => UserSubscriptionScalarWhereWithAggregatesInputSchema),z.lazy(() => UserSubscriptionScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => UserSubscriptionScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UserSubscriptionScalarWhereWithAggregatesInputSchema),z.lazy(() => UserSubscriptionScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  planId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  status: z.union([ z.lazy(() => EnumSubscriptionStatusWithAggregatesFilterSchema),z.lazy(() => SubscriptionStatusSchema) ]).optional(),
  startDate: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
  endDate: z.union([ z.lazy(() => DateTimeNullableWithAggregatesFilterSchema),z.coerce.date() ]).optional().nullable(),
  cancelledAt: z.union([ z.lazy(() => DateTimeNullableWithAggregatesFilterSchema),z.coerce.date() ]).optional().nullable(),
  paymentId: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  paymentMethod: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  amount: z.union([ z.lazy(() => DecimalWithAggregatesFilterSchema),z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional(),
  autoRenew: z.union([ z.lazy(() => BoolWithAggregatesFilterSchema),z.boolean() ]).optional(),
  nextBillingDate: z.union([ z.lazy(() => DateTimeNullableWithAggregatesFilterSchema),z.coerce.date() ]).optional().nullable(),
  createdAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
}).strict();

export const BlogCategoryWhereInputSchema: z.ZodType<Prisma.BlogCategoryWhereInput> = z.object({
  AND: z.union([ z.lazy(() => BlogCategoryWhereInputSchema),z.lazy(() => BlogCategoryWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => BlogCategoryWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => BlogCategoryWhereInputSchema),z.lazy(() => BlogCategoryWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  name: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  slug: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  description: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  posts: z.lazy(() => BlogPostListRelationFilterSchema).optional()
}).strict();

export const BlogCategoryOrderByWithRelationInputSchema: z.ZodType<Prisma.BlogCategoryOrderByWithRelationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  slug: z.lazy(() => SortOrderSchema).optional(),
  description: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  posts: z.lazy(() => BlogPostOrderByRelationAggregateInputSchema).optional()
}).strict();

export const BlogCategoryWhereUniqueInputSchema: z.ZodType<Prisma.BlogCategoryWhereUniqueInput> = z.union([
  z.object({
    id: z.string().cuid(),
    slug: z.string()
  }),
  z.object({
    id: z.string().cuid(),
  }),
  z.object({
    slug: z.string(),
  }),
])
.and(z.object({
  id: z.string().cuid().optional(),
  slug: z.string().optional(),
  AND: z.union([ z.lazy(() => BlogCategoryWhereInputSchema),z.lazy(() => BlogCategoryWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => BlogCategoryWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => BlogCategoryWhereInputSchema),z.lazy(() => BlogCategoryWhereInputSchema).array() ]).optional(),
  name: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  description: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  posts: z.lazy(() => BlogPostListRelationFilterSchema).optional()
}).strict());

export const BlogCategoryOrderByWithAggregationInputSchema: z.ZodType<Prisma.BlogCategoryOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  slug: z.lazy(() => SortOrderSchema).optional(),
  description: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  _count: z.lazy(() => BlogCategoryCountOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => BlogCategoryMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => BlogCategoryMinOrderByAggregateInputSchema).optional()
}).strict();

export const BlogCategoryScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.BlogCategoryScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => BlogCategoryScalarWhereWithAggregatesInputSchema),z.lazy(() => BlogCategoryScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => BlogCategoryScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => BlogCategoryScalarWhereWithAggregatesInputSchema),z.lazy(() => BlogCategoryScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  name: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  slug: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  description: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
}).strict();

export const UserCreateInputSchema: z.ZodType<Prisma.UserCreateInput> = z.object({
  id: z.string().cuid().optional(),
  name: z.string(),
  email: z.string(),
  emailVerified: z.boolean(),
  image: z.string().optional().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  username: z.string().optional().nullable(),
  role: z.string().optional().nullable(),
  banned: z.boolean().optional().nullable(),
  banReason: z.string().optional().nullable(),
  banExpires: z.coerce.date().optional().nullable(),
  onboardingComplete: z.boolean().optional(),
  paymentsCustomerId: z.string().optional().nullable(),
  locale: z.string().optional().nullable(),
  membershipLevel: z.lazy(() => MembershipLevelSchema).optional(),
  sessions: z.lazy(() => SessionCreateNestedManyWithoutUserInputSchema).optional(),
  accounts: z.lazy(() => AccountCreateNestedManyWithoutUserInputSchema).optional(),
  passkeys: z.lazy(() => PasskeyCreateNestedManyWithoutUserInputSchema).optional(),
  invitations: z.lazy(() => InvitationCreateNestedManyWithoutUserInputSchema).optional(),
  purchases: z.lazy(() => PurchaseCreateNestedManyWithoutUserInputSchema).optional(),
  memberships: z.lazy(() => MemberCreateNestedManyWithoutUserInputSchema).optional(),
  aiChats: z.lazy(() => AiChatCreateNestedManyWithoutUserInputSchema).optional(),
  subscriptions: z.lazy(() => UserSubscriptionCreateNestedManyWithoutUserInputSchema).optional(),
  blogPosts: z.lazy(() => BlogPostCreateNestedManyWithoutAuthorInputSchema).optional()
}).strict();

export const UserUncheckedCreateInputSchema: z.ZodType<Prisma.UserUncheckedCreateInput> = z.object({
  id: z.string().cuid().optional(),
  name: z.string(),
  email: z.string(),
  emailVerified: z.boolean(),
  image: z.string().optional().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  username: z.string().optional().nullable(),
  role: z.string().optional().nullable(),
  banned: z.boolean().optional().nullable(),
  banReason: z.string().optional().nullable(),
  banExpires: z.coerce.date().optional().nullable(),
  onboardingComplete: z.boolean().optional(),
  paymentsCustomerId: z.string().optional().nullable(),
  locale: z.string().optional().nullable(),
  membershipLevel: z.lazy(() => MembershipLevelSchema).optional(),
  sessions: z.lazy(() => SessionUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  accounts: z.lazy(() => AccountUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  passkeys: z.lazy(() => PasskeyUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  invitations: z.lazy(() => InvitationUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  purchases: z.lazy(() => PurchaseUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  memberships: z.lazy(() => MemberUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  aiChats: z.lazy(() => AiChatUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  subscriptions: z.lazy(() => UserSubscriptionUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  blogPosts: z.lazy(() => BlogPostUncheckedCreateNestedManyWithoutAuthorInputSchema).optional()
}).strict();

export const UserUpdateInputSchema: z.ZodType<Prisma.UserUpdateInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  emailVerified: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  image: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  username: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  role: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  banned: z.union([ z.boolean(),z.lazy(() => NullableBoolFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  banReason: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  banExpires: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  onboardingComplete: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  paymentsCustomerId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  locale: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  membershipLevel: z.union([ z.lazy(() => MembershipLevelSchema),z.lazy(() => EnumMembershipLevelFieldUpdateOperationsInputSchema) ]).optional(),
  sessions: z.lazy(() => SessionUpdateManyWithoutUserNestedInputSchema).optional(),
  accounts: z.lazy(() => AccountUpdateManyWithoutUserNestedInputSchema).optional(),
  passkeys: z.lazy(() => PasskeyUpdateManyWithoutUserNestedInputSchema).optional(),
  invitations: z.lazy(() => InvitationUpdateManyWithoutUserNestedInputSchema).optional(),
  purchases: z.lazy(() => PurchaseUpdateManyWithoutUserNestedInputSchema).optional(),
  memberships: z.lazy(() => MemberUpdateManyWithoutUserNestedInputSchema).optional(),
  aiChats: z.lazy(() => AiChatUpdateManyWithoutUserNestedInputSchema).optional(),
  subscriptions: z.lazy(() => UserSubscriptionUpdateManyWithoutUserNestedInputSchema).optional(),
  blogPosts: z.lazy(() => BlogPostUpdateManyWithoutAuthorNestedInputSchema).optional()
}).strict();

export const UserUncheckedUpdateInputSchema: z.ZodType<Prisma.UserUncheckedUpdateInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  emailVerified: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  image: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  username: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  role: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  banned: z.union([ z.boolean(),z.lazy(() => NullableBoolFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  banReason: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  banExpires: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  onboardingComplete: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  paymentsCustomerId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  locale: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  membershipLevel: z.union([ z.lazy(() => MembershipLevelSchema),z.lazy(() => EnumMembershipLevelFieldUpdateOperationsInputSchema) ]).optional(),
  sessions: z.lazy(() => SessionUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  accounts: z.lazy(() => AccountUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  passkeys: z.lazy(() => PasskeyUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  invitations: z.lazy(() => InvitationUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  purchases: z.lazy(() => PurchaseUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  memberships: z.lazy(() => MemberUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  aiChats: z.lazy(() => AiChatUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  subscriptions: z.lazy(() => UserSubscriptionUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  blogPosts: z.lazy(() => BlogPostUncheckedUpdateManyWithoutAuthorNestedInputSchema).optional()
}).strict();

export const UserCreateManyInputSchema: z.ZodType<Prisma.UserCreateManyInput> = z.object({
  id: z.string().cuid().optional(),
  name: z.string(),
  email: z.string(),
  emailVerified: z.boolean(),
  image: z.string().optional().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  username: z.string().optional().nullable(),
  role: z.string().optional().nullable(),
  banned: z.boolean().optional().nullable(),
  banReason: z.string().optional().nullable(),
  banExpires: z.coerce.date().optional().nullable(),
  onboardingComplete: z.boolean().optional(),
  paymentsCustomerId: z.string().optional().nullable(),
  locale: z.string().optional().nullable(),
  membershipLevel: z.lazy(() => MembershipLevelSchema).optional()
}).strict();

export const UserUpdateManyMutationInputSchema: z.ZodType<Prisma.UserUpdateManyMutationInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  emailVerified: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  image: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  username: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  role: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  banned: z.union([ z.boolean(),z.lazy(() => NullableBoolFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  banReason: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  banExpires: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  onboardingComplete: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  paymentsCustomerId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  locale: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  membershipLevel: z.union([ z.lazy(() => MembershipLevelSchema),z.lazy(() => EnumMembershipLevelFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const UserUncheckedUpdateManyInputSchema: z.ZodType<Prisma.UserUncheckedUpdateManyInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  emailVerified: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  image: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  username: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  role: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  banned: z.union([ z.boolean(),z.lazy(() => NullableBoolFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  banReason: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  banExpires: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  onboardingComplete: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  paymentsCustomerId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  locale: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  membershipLevel: z.union([ z.lazy(() => MembershipLevelSchema),z.lazy(() => EnumMembershipLevelFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const SessionCreateInputSchema: z.ZodType<Prisma.SessionCreateInput> = z.object({
  id: z.string().cuid().optional(),
  expiresAt: z.coerce.date(),
  ipAddress: z.string().optional().nullable(),
  userAgent: z.string().optional().nullable(),
  impersonatedBy: z.string().optional().nullable(),
  activeOrganizationId: z.string().optional().nullable(),
  token: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  user: z.lazy(() => UserCreateNestedOneWithoutSessionsInputSchema)
}).strict();

export const SessionUncheckedCreateInputSchema: z.ZodType<Prisma.SessionUncheckedCreateInput> = z.object({
  id: z.string().cuid().optional(),
  expiresAt: z.coerce.date(),
  ipAddress: z.string().optional().nullable(),
  userAgent: z.string().optional().nullable(),
  userId: z.string(),
  impersonatedBy: z.string().optional().nullable(),
  activeOrganizationId: z.string().optional().nullable(),
  token: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date()
}).strict();

export const SessionUpdateInputSchema: z.ZodType<Prisma.SessionUpdateInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  expiresAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  ipAddress: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  userAgent: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  impersonatedBy: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  activeOrganizationId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  token: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  user: z.lazy(() => UserUpdateOneRequiredWithoutSessionsNestedInputSchema).optional()
}).strict();

export const SessionUncheckedUpdateInputSchema: z.ZodType<Prisma.SessionUncheckedUpdateInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  expiresAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  ipAddress: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  userAgent: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  impersonatedBy: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  activeOrganizationId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  token: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const SessionCreateManyInputSchema: z.ZodType<Prisma.SessionCreateManyInput> = z.object({
  id: z.string().cuid().optional(),
  expiresAt: z.coerce.date(),
  ipAddress: z.string().optional().nullable(),
  userAgent: z.string().optional().nullable(),
  userId: z.string(),
  impersonatedBy: z.string().optional().nullable(),
  activeOrganizationId: z.string().optional().nullable(),
  token: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date()
}).strict();

export const SessionUpdateManyMutationInputSchema: z.ZodType<Prisma.SessionUpdateManyMutationInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  expiresAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  ipAddress: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  userAgent: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  impersonatedBy: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  activeOrganizationId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  token: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const SessionUncheckedUpdateManyInputSchema: z.ZodType<Prisma.SessionUncheckedUpdateManyInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  expiresAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  ipAddress: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  userAgent: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  impersonatedBy: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  activeOrganizationId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  token: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const AccountCreateInputSchema: z.ZodType<Prisma.AccountCreateInput> = z.object({
  id: z.string().cuid().optional(),
  accountId: z.string(),
  providerId: z.string(),
  accessToken: z.string().optional().nullable(),
  refreshToken: z.string().optional().nullable(),
  idToken: z.string().optional().nullable(),
  expiresAt: z.coerce.date().optional().nullable(),
  password: z.string().optional().nullable(),
  accessTokenExpiresAt: z.coerce.date().optional().nullable(),
  refreshTokenExpiresAt: z.coerce.date().optional().nullable(),
  scope: z.string().optional().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  user: z.lazy(() => UserCreateNestedOneWithoutAccountsInputSchema)
}).strict();

export const AccountUncheckedCreateInputSchema: z.ZodType<Prisma.AccountUncheckedCreateInput> = z.object({
  id: z.string().cuid().optional(),
  accountId: z.string(),
  providerId: z.string(),
  userId: z.string(),
  accessToken: z.string().optional().nullable(),
  refreshToken: z.string().optional().nullable(),
  idToken: z.string().optional().nullable(),
  expiresAt: z.coerce.date().optional().nullable(),
  password: z.string().optional().nullable(),
  accessTokenExpiresAt: z.coerce.date().optional().nullable(),
  refreshTokenExpiresAt: z.coerce.date().optional().nullable(),
  scope: z.string().optional().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date()
}).strict();

export const AccountUpdateInputSchema: z.ZodType<Prisma.AccountUpdateInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  accountId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  providerId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  accessToken: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  refreshToken: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  idToken: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  expiresAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  password: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  accessTokenExpiresAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  refreshTokenExpiresAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  scope: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  user: z.lazy(() => UserUpdateOneRequiredWithoutAccountsNestedInputSchema).optional()
}).strict();

export const AccountUncheckedUpdateInputSchema: z.ZodType<Prisma.AccountUncheckedUpdateInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  accountId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  providerId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  accessToken: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  refreshToken: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  idToken: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  expiresAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  password: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  accessTokenExpiresAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  refreshTokenExpiresAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  scope: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const AccountCreateManyInputSchema: z.ZodType<Prisma.AccountCreateManyInput> = z.object({
  id: z.string().cuid().optional(),
  accountId: z.string(),
  providerId: z.string(),
  userId: z.string(),
  accessToken: z.string().optional().nullable(),
  refreshToken: z.string().optional().nullable(),
  idToken: z.string().optional().nullable(),
  expiresAt: z.coerce.date().optional().nullable(),
  password: z.string().optional().nullable(),
  accessTokenExpiresAt: z.coerce.date().optional().nullable(),
  refreshTokenExpiresAt: z.coerce.date().optional().nullable(),
  scope: z.string().optional().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date()
}).strict();

export const AccountUpdateManyMutationInputSchema: z.ZodType<Prisma.AccountUpdateManyMutationInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  accountId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  providerId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  accessToken: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  refreshToken: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  idToken: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  expiresAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  password: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  accessTokenExpiresAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  refreshTokenExpiresAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  scope: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const AccountUncheckedUpdateManyInputSchema: z.ZodType<Prisma.AccountUncheckedUpdateManyInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  accountId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  providerId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  accessToken: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  refreshToken: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  idToken: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  expiresAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  password: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  accessTokenExpiresAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  refreshTokenExpiresAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  scope: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const VerificationCreateInputSchema: z.ZodType<Prisma.VerificationCreateInput> = z.object({
  id: z.string().cuid().optional(),
  identifier: z.string(),
  value: z.string(),
  expiresAt: z.coerce.date(),
  createdAt: z.coerce.date().optional().nullable(),
  updatedAt: z.coerce.date().optional().nullable()
}).strict();

export const VerificationUncheckedCreateInputSchema: z.ZodType<Prisma.VerificationUncheckedCreateInput> = z.object({
  id: z.string().cuid().optional(),
  identifier: z.string(),
  value: z.string(),
  expiresAt: z.coerce.date(),
  createdAt: z.coerce.date().optional().nullable(),
  updatedAt: z.coerce.date().optional().nullable()
}).strict();

export const VerificationUpdateInputSchema: z.ZodType<Prisma.VerificationUpdateInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  identifier: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  value: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  expiresAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
}).strict();

export const VerificationUncheckedUpdateInputSchema: z.ZodType<Prisma.VerificationUncheckedUpdateInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  identifier: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  value: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  expiresAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
}).strict();

export const VerificationCreateManyInputSchema: z.ZodType<Prisma.VerificationCreateManyInput> = z.object({
  id: z.string().cuid().optional(),
  identifier: z.string(),
  value: z.string(),
  expiresAt: z.coerce.date(),
  createdAt: z.coerce.date().optional().nullable(),
  updatedAt: z.coerce.date().optional().nullable()
}).strict();

export const VerificationUpdateManyMutationInputSchema: z.ZodType<Prisma.VerificationUpdateManyMutationInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  identifier: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  value: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  expiresAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
}).strict();

export const VerificationUncheckedUpdateManyInputSchema: z.ZodType<Prisma.VerificationUncheckedUpdateManyInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  identifier: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  value: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  expiresAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
}).strict();

export const PasskeyCreateInputSchema: z.ZodType<Prisma.PasskeyCreateInput> = z.object({
  id: z.string().cuid().optional(),
  name: z.string().optional().nullable(),
  publicKey: z.string(),
  credentialID: z.string(),
  counter: z.number().int(),
  deviceType: z.string(),
  backedUp: z.boolean(),
  transports: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional().nullable(),
  user: z.lazy(() => UserCreateNestedOneWithoutPasskeysInputSchema)
}).strict();

export const PasskeyUncheckedCreateInputSchema: z.ZodType<Prisma.PasskeyUncheckedCreateInput> = z.object({
  id: z.string().cuid().optional(),
  name: z.string().optional().nullable(),
  publicKey: z.string(),
  userId: z.string(),
  credentialID: z.string(),
  counter: z.number().int(),
  deviceType: z.string(),
  backedUp: z.boolean(),
  transports: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional().nullable()
}).strict();

export const PasskeyUpdateInputSchema: z.ZodType<Prisma.PasskeyUpdateInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  publicKey: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  credentialID: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  counter: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  deviceType: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  backedUp: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  transports: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  user: z.lazy(() => UserUpdateOneRequiredWithoutPasskeysNestedInputSchema).optional()
}).strict();

export const PasskeyUncheckedUpdateInputSchema: z.ZodType<Prisma.PasskeyUncheckedUpdateInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  publicKey: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  credentialID: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  counter: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  deviceType: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  backedUp: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  transports: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
}).strict();

export const PasskeyCreateManyInputSchema: z.ZodType<Prisma.PasskeyCreateManyInput> = z.object({
  id: z.string().cuid().optional(),
  name: z.string().optional().nullable(),
  publicKey: z.string(),
  userId: z.string(),
  credentialID: z.string(),
  counter: z.number().int(),
  deviceType: z.string(),
  backedUp: z.boolean(),
  transports: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional().nullable()
}).strict();

export const PasskeyUpdateManyMutationInputSchema: z.ZodType<Prisma.PasskeyUpdateManyMutationInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  publicKey: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  credentialID: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  counter: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  deviceType: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  backedUp: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  transports: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
}).strict();

export const PasskeyUncheckedUpdateManyInputSchema: z.ZodType<Prisma.PasskeyUncheckedUpdateManyInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  publicKey: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  credentialID: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  counter: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  deviceType: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  backedUp: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  transports: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
}).strict();

export const OrganizationCreateInputSchema: z.ZodType<Prisma.OrganizationCreateInput> = z.object({
  id: z.string().cuid().optional(),
  name: z.string(),
  slug: z.string().optional().nullable(),
  logo: z.string().optional().nullable(),
  createdAt: z.coerce.date(),
  metadata: z.string().optional().nullable(),
  paymentsCustomerId: z.string().optional().nullable(),
  members: z.lazy(() => MemberCreateNestedManyWithoutOrganizationInputSchema).optional(),
  invitations: z.lazy(() => InvitationCreateNestedManyWithoutOrganizationInputSchema).optional(),
  purchases: z.lazy(() => PurchaseCreateNestedManyWithoutOrganizationInputSchema).optional(),
  aiChats: z.lazy(() => AiChatCreateNestedManyWithoutOrganizationInputSchema).optional()
}).strict();

export const OrganizationUncheckedCreateInputSchema: z.ZodType<Prisma.OrganizationUncheckedCreateInput> = z.object({
  id: z.string().cuid().optional(),
  name: z.string(),
  slug: z.string().optional().nullable(),
  logo: z.string().optional().nullable(),
  createdAt: z.coerce.date(),
  metadata: z.string().optional().nullable(),
  paymentsCustomerId: z.string().optional().nullable(),
  members: z.lazy(() => MemberUncheckedCreateNestedManyWithoutOrganizationInputSchema).optional(),
  invitations: z.lazy(() => InvitationUncheckedCreateNestedManyWithoutOrganizationInputSchema).optional(),
  purchases: z.lazy(() => PurchaseUncheckedCreateNestedManyWithoutOrganizationInputSchema).optional(),
  aiChats: z.lazy(() => AiChatUncheckedCreateNestedManyWithoutOrganizationInputSchema).optional()
}).strict();

export const OrganizationUpdateInputSchema: z.ZodType<Prisma.OrganizationUpdateInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  slug: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  logo: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  metadata: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  paymentsCustomerId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  members: z.lazy(() => MemberUpdateManyWithoutOrganizationNestedInputSchema).optional(),
  invitations: z.lazy(() => InvitationUpdateManyWithoutOrganizationNestedInputSchema).optional(),
  purchases: z.lazy(() => PurchaseUpdateManyWithoutOrganizationNestedInputSchema).optional(),
  aiChats: z.lazy(() => AiChatUpdateManyWithoutOrganizationNestedInputSchema).optional()
}).strict();

export const OrganizationUncheckedUpdateInputSchema: z.ZodType<Prisma.OrganizationUncheckedUpdateInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  slug: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  logo: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  metadata: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  paymentsCustomerId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  members: z.lazy(() => MemberUncheckedUpdateManyWithoutOrganizationNestedInputSchema).optional(),
  invitations: z.lazy(() => InvitationUncheckedUpdateManyWithoutOrganizationNestedInputSchema).optional(),
  purchases: z.lazy(() => PurchaseUncheckedUpdateManyWithoutOrganizationNestedInputSchema).optional(),
  aiChats: z.lazy(() => AiChatUncheckedUpdateManyWithoutOrganizationNestedInputSchema).optional()
}).strict();

export const OrganizationCreateManyInputSchema: z.ZodType<Prisma.OrganizationCreateManyInput> = z.object({
  id: z.string().cuid().optional(),
  name: z.string(),
  slug: z.string().optional().nullable(),
  logo: z.string().optional().nullable(),
  createdAt: z.coerce.date(),
  metadata: z.string().optional().nullable(),
  paymentsCustomerId: z.string().optional().nullable()
}).strict();

export const OrganizationUpdateManyMutationInputSchema: z.ZodType<Prisma.OrganizationUpdateManyMutationInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  slug: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  logo: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  metadata: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  paymentsCustomerId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
}).strict();

export const OrganizationUncheckedUpdateManyInputSchema: z.ZodType<Prisma.OrganizationUncheckedUpdateManyInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  slug: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  logo: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  metadata: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  paymentsCustomerId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
}).strict();

export const MemberCreateInputSchema: z.ZodType<Prisma.MemberCreateInput> = z.object({
  id: z.string().cuid().optional(),
  role: z.string(),
  createdAt: z.coerce.date(),
  organization: z.lazy(() => OrganizationCreateNestedOneWithoutMembersInputSchema),
  user: z.lazy(() => UserCreateNestedOneWithoutMembershipsInputSchema)
}).strict();

export const MemberUncheckedCreateInputSchema: z.ZodType<Prisma.MemberUncheckedCreateInput> = z.object({
  id: z.string().cuid().optional(),
  organizationId: z.string(),
  userId: z.string(),
  role: z.string(),
  createdAt: z.coerce.date()
}).strict();

export const MemberUpdateInputSchema: z.ZodType<Prisma.MemberUpdateInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  role: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  organization: z.lazy(() => OrganizationUpdateOneRequiredWithoutMembersNestedInputSchema).optional(),
  user: z.lazy(() => UserUpdateOneRequiredWithoutMembershipsNestedInputSchema).optional()
}).strict();

export const MemberUncheckedUpdateInputSchema: z.ZodType<Prisma.MemberUncheckedUpdateInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  organizationId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  role: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const MemberCreateManyInputSchema: z.ZodType<Prisma.MemberCreateManyInput> = z.object({
  id: z.string().cuid().optional(),
  organizationId: z.string(),
  userId: z.string(),
  role: z.string(),
  createdAt: z.coerce.date()
}).strict();

export const MemberUpdateManyMutationInputSchema: z.ZodType<Prisma.MemberUpdateManyMutationInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  role: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const MemberUncheckedUpdateManyInputSchema: z.ZodType<Prisma.MemberUncheckedUpdateManyInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  organizationId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  role: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const InvitationCreateInputSchema: z.ZodType<Prisma.InvitationCreateInput> = z.object({
  id: z.string().cuid().optional(),
  email: z.string(),
  role: z.string().optional().nullable(),
  status: z.string(),
  expiresAt: z.coerce.date(),
  organization: z.lazy(() => OrganizationCreateNestedOneWithoutInvitationsInputSchema),
  user: z.lazy(() => UserCreateNestedOneWithoutInvitationsInputSchema)
}).strict();

export const InvitationUncheckedCreateInputSchema: z.ZodType<Prisma.InvitationUncheckedCreateInput> = z.object({
  id: z.string().cuid().optional(),
  organizationId: z.string(),
  email: z.string(),
  role: z.string().optional().nullable(),
  status: z.string(),
  expiresAt: z.coerce.date(),
  inviterId: z.string()
}).strict();

export const InvitationUpdateInputSchema: z.ZodType<Prisma.InvitationUpdateInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  role: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  status: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  expiresAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  organization: z.lazy(() => OrganizationUpdateOneRequiredWithoutInvitationsNestedInputSchema).optional(),
  user: z.lazy(() => UserUpdateOneRequiredWithoutInvitationsNestedInputSchema).optional()
}).strict();

export const InvitationUncheckedUpdateInputSchema: z.ZodType<Prisma.InvitationUncheckedUpdateInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  organizationId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  role: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  status: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  expiresAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  inviterId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const InvitationCreateManyInputSchema: z.ZodType<Prisma.InvitationCreateManyInput> = z.object({
  id: z.string().cuid().optional(),
  organizationId: z.string(),
  email: z.string(),
  role: z.string().optional().nullable(),
  status: z.string(),
  expiresAt: z.coerce.date(),
  inviterId: z.string()
}).strict();

export const InvitationUpdateManyMutationInputSchema: z.ZodType<Prisma.InvitationUpdateManyMutationInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  role: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  status: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  expiresAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const InvitationUncheckedUpdateManyInputSchema: z.ZodType<Prisma.InvitationUncheckedUpdateManyInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  organizationId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  role: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  status: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  expiresAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  inviterId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const PurchaseCreateInputSchema: z.ZodType<Prisma.PurchaseCreateInput> = z.object({
  id: z.string().cuid().optional(),
  type: z.lazy(() => PurchaseTypeSchema),
  customerId: z.string(),
  subscriptionId: z.string().optional().nullable(),
  productId: z.string(),
  status: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  organization: z.lazy(() => OrganizationCreateNestedOneWithoutPurchasesInputSchema).optional(),
  user: z.lazy(() => UserCreateNestedOneWithoutPurchasesInputSchema).optional()
}).strict();

export const PurchaseUncheckedCreateInputSchema: z.ZodType<Prisma.PurchaseUncheckedCreateInput> = z.object({
  id: z.string().cuid().optional(),
  organizationId: z.string().optional().nullable(),
  userId: z.string().optional().nullable(),
  type: z.lazy(() => PurchaseTypeSchema),
  customerId: z.string(),
  subscriptionId: z.string().optional().nullable(),
  productId: z.string(),
  status: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional()
}).strict();

export const PurchaseUpdateInputSchema: z.ZodType<Prisma.PurchaseUpdateInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.lazy(() => PurchaseTypeSchema),z.lazy(() => EnumPurchaseTypeFieldUpdateOperationsInputSchema) ]).optional(),
  customerId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  subscriptionId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  productId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  organization: z.lazy(() => OrganizationUpdateOneWithoutPurchasesNestedInputSchema).optional(),
  user: z.lazy(() => UserUpdateOneWithoutPurchasesNestedInputSchema).optional()
}).strict();

export const PurchaseUncheckedUpdateInputSchema: z.ZodType<Prisma.PurchaseUncheckedUpdateInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  organizationId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  userId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  type: z.union([ z.lazy(() => PurchaseTypeSchema),z.lazy(() => EnumPurchaseTypeFieldUpdateOperationsInputSchema) ]).optional(),
  customerId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  subscriptionId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  productId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const PurchaseCreateManyInputSchema: z.ZodType<Prisma.PurchaseCreateManyInput> = z.object({
  id: z.string().cuid().optional(),
  organizationId: z.string().optional().nullable(),
  userId: z.string().optional().nullable(),
  type: z.lazy(() => PurchaseTypeSchema),
  customerId: z.string(),
  subscriptionId: z.string().optional().nullable(),
  productId: z.string(),
  status: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional()
}).strict();

export const PurchaseUpdateManyMutationInputSchema: z.ZodType<Prisma.PurchaseUpdateManyMutationInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.lazy(() => PurchaseTypeSchema),z.lazy(() => EnumPurchaseTypeFieldUpdateOperationsInputSchema) ]).optional(),
  customerId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  subscriptionId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  productId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const PurchaseUncheckedUpdateManyInputSchema: z.ZodType<Prisma.PurchaseUncheckedUpdateManyInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  organizationId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  userId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  type: z.union([ z.lazy(() => PurchaseTypeSchema),z.lazy(() => EnumPurchaseTypeFieldUpdateOperationsInputSchema) ]).optional(),
  customerId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  subscriptionId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  productId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const AiChatCreateInputSchema: z.ZodType<Prisma.AiChatCreateInput> = z.object({
  id: z.string().cuid().optional(),
  title: z.string().optional().nullable(),
  messages: z.union([ z.lazy(() => JsonNullValueInputSchema),z.array(z.object({ role: z.enum(['user', 'assistant']), content: z.string() })) ]).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  organization: z.lazy(() => OrganizationCreateNestedOneWithoutAiChatsInputSchema).optional(),
  user: z.lazy(() => UserCreateNestedOneWithoutAiChatsInputSchema).optional()
}).strict();

export const AiChatUncheckedCreateInputSchema: z.ZodType<Prisma.AiChatUncheckedCreateInput> = z.object({
  id: z.string().cuid().optional(),
  organizationId: z.string().optional().nullable(),
  userId: z.string().optional().nullable(),
  title: z.string().optional().nullable(),
  messages: z.union([ z.lazy(() => JsonNullValueInputSchema),z.array(z.object({ role: z.enum(['user', 'assistant']), content: z.string() })) ]).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional()
}).strict();

export const AiChatUpdateInputSchema: z.ZodType<Prisma.AiChatUpdateInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  title: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  messages: z.union([ z.lazy(() => JsonNullValueInputSchema),z.array(z.object({ role: z.enum(['user', 'assistant']), content: z.string() })) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  organization: z.lazy(() => OrganizationUpdateOneWithoutAiChatsNestedInputSchema).optional(),
  user: z.lazy(() => UserUpdateOneWithoutAiChatsNestedInputSchema).optional()
}).strict();

export const AiChatUncheckedUpdateInputSchema: z.ZodType<Prisma.AiChatUncheckedUpdateInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  organizationId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  userId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  title: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  messages: z.union([ z.lazy(() => JsonNullValueInputSchema),z.array(z.object({ role: z.enum(['user', 'assistant']), content: z.string() })) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const AiChatCreateManyInputSchema: z.ZodType<Prisma.AiChatCreateManyInput> = z.object({
  id: z.string().cuid().optional(),
  organizationId: z.string().optional().nullable(),
  userId: z.string().optional().nullable(),
  title: z.string().optional().nullable(),
  messages: z.union([ z.lazy(() => JsonNullValueInputSchema),z.array(z.object({ role: z.enum(['user', 'assistant']), content: z.string() })) ]).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional()
}).strict();

export const AiChatUpdateManyMutationInputSchema: z.ZodType<Prisma.AiChatUpdateManyMutationInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  title: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  messages: z.union([ z.lazy(() => JsonNullValueInputSchema),z.array(z.object({ role: z.enum(['user', 'assistant']), content: z.string() })) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const AiChatUncheckedUpdateManyInputSchema: z.ZodType<Prisma.AiChatUncheckedUpdateManyInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  organizationId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  userId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  title: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  messages: z.union([ z.lazy(() => JsonNullValueInputSchema),z.array(z.object({ role: z.enum(['user', 'assistant']), content: z.string() })) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const BlogPostCreateInputSchema: z.ZodType<Prisma.BlogPostCreateInput> = z.object({
  id: z.string().cuid().optional(),
  slug: z.string(),
  title: z.string(),
  excerpt: z.string().optional().nullable(),
  content: z.string(),
  image: z.string().optional().nullable(),
  accessLevel: z.lazy(() => AccessLevelSchema).optional(),
  previewContent: z.string().optional().nullable(),
  tags: z.union([ z.lazy(() => BlogPostCreatetagsInputSchema),z.string().array() ]).optional(),
  published: z.boolean().optional(),
  publishedAt: z.coerce.date().optional().nullable(),
  viewCount: z.number().int().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  author: z.lazy(() => UserCreateNestedOneWithoutBlogPostsInputSchema),
  categories: z.lazy(() => BlogCategoryCreateNestedManyWithoutPostsInputSchema).optional()
}).strict();

export const BlogPostUncheckedCreateInputSchema: z.ZodType<Prisma.BlogPostUncheckedCreateInput> = z.object({
  id: z.string().cuid().optional(),
  slug: z.string(),
  title: z.string(),
  excerpt: z.string().optional().nullable(),
  content: z.string(),
  image: z.string().optional().nullable(),
  authorId: z.string(),
  accessLevel: z.lazy(() => AccessLevelSchema).optional(),
  previewContent: z.string().optional().nullable(),
  tags: z.union([ z.lazy(() => BlogPostCreatetagsInputSchema),z.string().array() ]).optional(),
  published: z.boolean().optional(),
  publishedAt: z.coerce.date().optional().nullable(),
  viewCount: z.number().int().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  categories: z.lazy(() => BlogCategoryUncheckedCreateNestedManyWithoutPostsInputSchema).optional()
}).strict();

export const BlogPostUpdateInputSchema: z.ZodType<Prisma.BlogPostUpdateInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  slug: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  title: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  excerpt: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  content: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  image: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  accessLevel: z.union([ z.lazy(() => AccessLevelSchema),z.lazy(() => EnumAccessLevelFieldUpdateOperationsInputSchema) ]).optional(),
  previewContent: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  tags: z.union([ z.lazy(() => BlogPostUpdatetagsInputSchema),z.string().array() ]).optional(),
  published: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  publishedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  viewCount: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  author: z.lazy(() => UserUpdateOneRequiredWithoutBlogPostsNestedInputSchema).optional(),
  categories: z.lazy(() => BlogCategoryUpdateManyWithoutPostsNestedInputSchema).optional()
}).strict();

export const BlogPostUncheckedUpdateInputSchema: z.ZodType<Prisma.BlogPostUncheckedUpdateInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  slug: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  title: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  excerpt: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  content: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  image: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  authorId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  accessLevel: z.union([ z.lazy(() => AccessLevelSchema),z.lazy(() => EnumAccessLevelFieldUpdateOperationsInputSchema) ]).optional(),
  previewContent: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  tags: z.union([ z.lazy(() => BlogPostUpdatetagsInputSchema),z.string().array() ]).optional(),
  published: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  publishedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  viewCount: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  categories: z.lazy(() => BlogCategoryUncheckedUpdateManyWithoutPostsNestedInputSchema).optional()
}).strict();

export const BlogPostCreateManyInputSchema: z.ZodType<Prisma.BlogPostCreateManyInput> = z.object({
  id: z.string().cuid().optional(),
  slug: z.string(),
  title: z.string(),
  excerpt: z.string().optional().nullable(),
  content: z.string(),
  image: z.string().optional().nullable(),
  authorId: z.string(),
  accessLevel: z.lazy(() => AccessLevelSchema).optional(),
  previewContent: z.string().optional().nullable(),
  tags: z.union([ z.lazy(() => BlogPostCreatetagsInputSchema),z.string().array() ]).optional(),
  published: z.boolean().optional(),
  publishedAt: z.coerce.date().optional().nullable(),
  viewCount: z.number().int().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional()
}).strict();

export const BlogPostUpdateManyMutationInputSchema: z.ZodType<Prisma.BlogPostUpdateManyMutationInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  slug: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  title: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  excerpt: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  content: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  image: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  accessLevel: z.union([ z.lazy(() => AccessLevelSchema),z.lazy(() => EnumAccessLevelFieldUpdateOperationsInputSchema) ]).optional(),
  previewContent: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  tags: z.union([ z.lazy(() => BlogPostUpdatetagsInputSchema),z.string().array() ]).optional(),
  published: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  publishedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  viewCount: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const BlogPostUncheckedUpdateManyInputSchema: z.ZodType<Prisma.BlogPostUncheckedUpdateManyInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  slug: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  title: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  excerpt: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  content: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  image: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  authorId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  accessLevel: z.union([ z.lazy(() => AccessLevelSchema),z.lazy(() => EnumAccessLevelFieldUpdateOperationsInputSchema) ]).optional(),
  previewContent: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  tags: z.union([ z.lazy(() => BlogPostUpdatetagsInputSchema),z.string().array() ]).optional(),
  published: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  publishedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  viewCount: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const SubscriptionPlanCreateInputSchema: z.ZodType<Prisma.SubscriptionPlanCreateInput> = z.object({
  id: z.string().cuid().optional(),
  name: z.string(),
  slug: z.string(),
  description: z.string().optional().nullable(),
  price: z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  currency: z.string().optional(),
  interval: z.lazy(() => PlanIntervalSchema),
  intervalCount: z.number().int().optional(),
  features: z.union([ z.lazy(() => JsonNullValueInputSchema),InputJsonValueSchema ]),
  active: z.boolean().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  subscriptions: z.lazy(() => UserSubscriptionCreateNestedManyWithoutPlanInputSchema).optional()
}).strict();

export const SubscriptionPlanUncheckedCreateInputSchema: z.ZodType<Prisma.SubscriptionPlanUncheckedCreateInput> = z.object({
  id: z.string().cuid().optional(),
  name: z.string(),
  slug: z.string(),
  description: z.string().optional().nullable(),
  price: z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  currency: z.string().optional(),
  interval: z.lazy(() => PlanIntervalSchema),
  intervalCount: z.number().int().optional(),
  features: z.union([ z.lazy(() => JsonNullValueInputSchema),InputJsonValueSchema ]),
  active: z.boolean().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  subscriptions: z.lazy(() => UserSubscriptionUncheckedCreateNestedManyWithoutPlanInputSchema).optional()
}).strict();

export const SubscriptionPlanUpdateInputSchema: z.ZodType<Prisma.SubscriptionPlanUpdateInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  slug: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  price: z.union([ z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  currency: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  interval: z.union([ z.lazy(() => PlanIntervalSchema),z.lazy(() => EnumPlanIntervalFieldUpdateOperationsInputSchema) ]).optional(),
  intervalCount: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  features: z.union([ z.lazy(() => JsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  active: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  subscriptions: z.lazy(() => UserSubscriptionUpdateManyWithoutPlanNestedInputSchema).optional()
}).strict();

export const SubscriptionPlanUncheckedUpdateInputSchema: z.ZodType<Prisma.SubscriptionPlanUncheckedUpdateInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  slug: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  price: z.union([ z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  currency: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  interval: z.union([ z.lazy(() => PlanIntervalSchema),z.lazy(() => EnumPlanIntervalFieldUpdateOperationsInputSchema) ]).optional(),
  intervalCount: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  features: z.union([ z.lazy(() => JsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  active: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  subscriptions: z.lazy(() => UserSubscriptionUncheckedUpdateManyWithoutPlanNestedInputSchema).optional()
}).strict();

export const SubscriptionPlanCreateManyInputSchema: z.ZodType<Prisma.SubscriptionPlanCreateManyInput> = z.object({
  id: z.string().cuid().optional(),
  name: z.string(),
  slug: z.string(),
  description: z.string().optional().nullable(),
  price: z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  currency: z.string().optional(),
  interval: z.lazy(() => PlanIntervalSchema),
  intervalCount: z.number().int().optional(),
  features: z.union([ z.lazy(() => JsonNullValueInputSchema),InputJsonValueSchema ]),
  active: z.boolean().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional()
}).strict();

export const SubscriptionPlanUpdateManyMutationInputSchema: z.ZodType<Prisma.SubscriptionPlanUpdateManyMutationInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  slug: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  price: z.union([ z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  currency: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  interval: z.union([ z.lazy(() => PlanIntervalSchema),z.lazy(() => EnumPlanIntervalFieldUpdateOperationsInputSchema) ]).optional(),
  intervalCount: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  features: z.union([ z.lazy(() => JsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  active: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const SubscriptionPlanUncheckedUpdateManyInputSchema: z.ZodType<Prisma.SubscriptionPlanUncheckedUpdateManyInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  slug: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  price: z.union([ z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  currency: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  interval: z.union([ z.lazy(() => PlanIntervalSchema),z.lazy(() => EnumPlanIntervalFieldUpdateOperationsInputSchema) ]).optional(),
  intervalCount: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  features: z.union([ z.lazy(() => JsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  active: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const UserSubscriptionCreateInputSchema: z.ZodType<Prisma.UserSubscriptionCreateInput> = z.object({
  id: z.string().cuid().optional(),
  status: z.lazy(() => SubscriptionStatusSchema),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional().nullable(),
  cancelledAt: z.coerce.date().optional().nullable(),
  paymentId: z.string().optional().nullable(),
  paymentMethod: z.string().optional().nullable(),
  amount: z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  autoRenew: z.boolean().optional(),
  nextBillingDate: z.coerce.date().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  user: z.lazy(() => UserCreateNestedOneWithoutSubscriptionsInputSchema),
  plan: z.lazy(() => SubscriptionPlanCreateNestedOneWithoutSubscriptionsInputSchema)
}).strict();

export const UserSubscriptionUncheckedCreateInputSchema: z.ZodType<Prisma.UserSubscriptionUncheckedCreateInput> = z.object({
  id: z.string().cuid().optional(),
  userId: z.string(),
  planId: z.string(),
  status: z.lazy(() => SubscriptionStatusSchema),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional().nullable(),
  cancelledAt: z.coerce.date().optional().nullable(),
  paymentId: z.string().optional().nullable(),
  paymentMethod: z.string().optional().nullable(),
  amount: z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  autoRenew: z.boolean().optional(),
  nextBillingDate: z.coerce.date().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional()
}).strict();

export const UserSubscriptionUpdateInputSchema: z.ZodType<Prisma.UserSubscriptionUpdateInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => SubscriptionStatusSchema),z.lazy(() => EnumSubscriptionStatusFieldUpdateOperationsInputSchema) ]).optional(),
  startDate: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  endDate: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  cancelledAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  paymentId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  paymentMethod: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  amount: z.union([ z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  autoRenew: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  nextBillingDate: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  user: z.lazy(() => UserUpdateOneRequiredWithoutSubscriptionsNestedInputSchema).optional(),
  plan: z.lazy(() => SubscriptionPlanUpdateOneRequiredWithoutSubscriptionsNestedInputSchema).optional()
}).strict();

export const UserSubscriptionUncheckedUpdateInputSchema: z.ZodType<Prisma.UserSubscriptionUncheckedUpdateInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  planId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => SubscriptionStatusSchema),z.lazy(() => EnumSubscriptionStatusFieldUpdateOperationsInputSchema) ]).optional(),
  startDate: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  endDate: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  cancelledAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  paymentId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  paymentMethod: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  amount: z.union([ z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  autoRenew: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  nextBillingDate: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const UserSubscriptionCreateManyInputSchema: z.ZodType<Prisma.UserSubscriptionCreateManyInput> = z.object({
  id: z.string().cuid().optional(),
  userId: z.string(),
  planId: z.string(),
  status: z.lazy(() => SubscriptionStatusSchema),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional().nullable(),
  cancelledAt: z.coerce.date().optional().nullable(),
  paymentId: z.string().optional().nullable(),
  paymentMethod: z.string().optional().nullable(),
  amount: z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  autoRenew: z.boolean().optional(),
  nextBillingDate: z.coerce.date().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional()
}).strict();

export const UserSubscriptionUpdateManyMutationInputSchema: z.ZodType<Prisma.UserSubscriptionUpdateManyMutationInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => SubscriptionStatusSchema),z.lazy(() => EnumSubscriptionStatusFieldUpdateOperationsInputSchema) ]).optional(),
  startDate: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  endDate: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  cancelledAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  paymentId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  paymentMethod: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  amount: z.union([ z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  autoRenew: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  nextBillingDate: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const UserSubscriptionUncheckedUpdateManyInputSchema: z.ZodType<Prisma.UserSubscriptionUncheckedUpdateManyInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  planId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => SubscriptionStatusSchema),z.lazy(() => EnumSubscriptionStatusFieldUpdateOperationsInputSchema) ]).optional(),
  startDate: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  endDate: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  cancelledAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  paymentId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  paymentMethod: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  amount: z.union([ z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  autoRenew: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  nextBillingDate: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const BlogCategoryCreateInputSchema: z.ZodType<Prisma.BlogCategoryCreateInput> = z.object({
  id: z.string().cuid().optional(),
  name: z.string(),
  slug: z.string(),
  description: z.string().optional().nullable(),
  posts: z.lazy(() => BlogPostCreateNestedManyWithoutCategoriesInputSchema).optional()
}).strict();

export const BlogCategoryUncheckedCreateInputSchema: z.ZodType<Prisma.BlogCategoryUncheckedCreateInput> = z.object({
  id: z.string().cuid().optional(),
  name: z.string(),
  slug: z.string(),
  description: z.string().optional().nullable(),
  posts: z.lazy(() => BlogPostUncheckedCreateNestedManyWithoutCategoriesInputSchema).optional()
}).strict();

export const BlogCategoryUpdateInputSchema: z.ZodType<Prisma.BlogCategoryUpdateInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  slug: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  posts: z.lazy(() => BlogPostUpdateManyWithoutCategoriesNestedInputSchema).optional()
}).strict();

export const BlogCategoryUncheckedUpdateInputSchema: z.ZodType<Prisma.BlogCategoryUncheckedUpdateInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  slug: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  posts: z.lazy(() => BlogPostUncheckedUpdateManyWithoutCategoriesNestedInputSchema).optional()
}).strict();

export const BlogCategoryCreateManyInputSchema: z.ZodType<Prisma.BlogCategoryCreateManyInput> = z.object({
  id: z.string().cuid().optional(),
  name: z.string(),
  slug: z.string(),
  description: z.string().optional().nullable()
}).strict();

export const BlogCategoryUpdateManyMutationInputSchema: z.ZodType<Prisma.BlogCategoryUpdateManyMutationInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  slug: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
}).strict();

export const BlogCategoryUncheckedUpdateManyInputSchema: z.ZodType<Prisma.BlogCategoryUncheckedUpdateManyInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  slug: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
}).strict();

export const StringFilterSchema: z.ZodType<Prisma.StringFilter> = z.object({
  equals: z.string().optional(),
  in: z.string().array().optional(),
  notIn: z.string().array().optional(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  mode: z.lazy(() => QueryModeSchema).optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringFilterSchema) ]).optional(),
}).strict();

export const BoolFilterSchema: z.ZodType<Prisma.BoolFilter> = z.object({
  equals: z.boolean().optional(),
  not: z.union([ z.boolean(),z.lazy(() => NestedBoolFilterSchema) ]).optional(),
}).strict();

export const StringNullableFilterSchema: z.ZodType<Prisma.StringNullableFilter> = z.object({
  equals: z.string().optional().nullable(),
  in: z.string().array().optional().nullable(),
  notIn: z.string().array().optional().nullable(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  mode: z.lazy(() => QueryModeSchema).optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringNullableFilterSchema) ]).optional().nullable(),
}).strict();

export const DateTimeFilterSchema: z.ZodType<Prisma.DateTimeFilter> = z.object({
  equals: z.coerce.date().optional(),
  in: z.coerce.date().array().optional(),
  notIn: z.coerce.date().array().optional(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  not: z.union([ z.coerce.date(),z.lazy(() => NestedDateTimeFilterSchema) ]).optional(),
}).strict();

export const BoolNullableFilterSchema: z.ZodType<Prisma.BoolNullableFilter> = z.object({
  equals: z.boolean().optional().nullable(),
  not: z.union([ z.boolean(),z.lazy(() => NestedBoolNullableFilterSchema) ]).optional().nullable(),
}).strict();

export const DateTimeNullableFilterSchema: z.ZodType<Prisma.DateTimeNullableFilter> = z.object({
  equals: z.coerce.date().optional().nullable(),
  in: z.coerce.date().array().optional().nullable(),
  notIn: z.coerce.date().array().optional().nullable(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  not: z.union([ z.coerce.date(),z.lazy(() => NestedDateTimeNullableFilterSchema) ]).optional().nullable(),
}).strict();

export const EnumMembershipLevelFilterSchema: z.ZodType<Prisma.EnumMembershipLevelFilter> = z.object({
  equals: z.lazy(() => MembershipLevelSchema).optional(),
  in: z.lazy(() => MembershipLevelSchema).array().optional(),
  notIn: z.lazy(() => MembershipLevelSchema).array().optional(),
  not: z.union([ z.lazy(() => MembershipLevelSchema),z.lazy(() => NestedEnumMembershipLevelFilterSchema) ]).optional(),
}).strict();

export const SessionListRelationFilterSchema: z.ZodType<Prisma.SessionListRelationFilter> = z.object({
  every: z.lazy(() => SessionWhereInputSchema).optional(),
  some: z.lazy(() => SessionWhereInputSchema).optional(),
  none: z.lazy(() => SessionWhereInputSchema).optional()
}).strict();

export const AccountListRelationFilterSchema: z.ZodType<Prisma.AccountListRelationFilter> = z.object({
  every: z.lazy(() => AccountWhereInputSchema).optional(),
  some: z.lazy(() => AccountWhereInputSchema).optional(),
  none: z.lazy(() => AccountWhereInputSchema).optional()
}).strict();

export const PasskeyListRelationFilterSchema: z.ZodType<Prisma.PasskeyListRelationFilter> = z.object({
  every: z.lazy(() => PasskeyWhereInputSchema).optional(),
  some: z.lazy(() => PasskeyWhereInputSchema).optional(),
  none: z.lazy(() => PasskeyWhereInputSchema).optional()
}).strict();

export const InvitationListRelationFilterSchema: z.ZodType<Prisma.InvitationListRelationFilter> = z.object({
  every: z.lazy(() => InvitationWhereInputSchema).optional(),
  some: z.lazy(() => InvitationWhereInputSchema).optional(),
  none: z.lazy(() => InvitationWhereInputSchema).optional()
}).strict();

export const PurchaseListRelationFilterSchema: z.ZodType<Prisma.PurchaseListRelationFilter> = z.object({
  every: z.lazy(() => PurchaseWhereInputSchema).optional(),
  some: z.lazy(() => PurchaseWhereInputSchema).optional(),
  none: z.lazy(() => PurchaseWhereInputSchema).optional()
}).strict();

export const MemberListRelationFilterSchema: z.ZodType<Prisma.MemberListRelationFilter> = z.object({
  every: z.lazy(() => MemberWhereInputSchema).optional(),
  some: z.lazy(() => MemberWhereInputSchema).optional(),
  none: z.lazy(() => MemberWhereInputSchema).optional()
}).strict();

export const AiChatListRelationFilterSchema: z.ZodType<Prisma.AiChatListRelationFilter> = z.object({
  every: z.lazy(() => AiChatWhereInputSchema).optional(),
  some: z.lazy(() => AiChatWhereInputSchema).optional(),
  none: z.lazy(() => AiChatWhereInputSchema).optional()
}).strict();

export const UserSubscriptionListRelationFilterSchema: z.ZodType<Prisma.UserSubscriptionListRelationFilter> = z.object({
  every: z.lazy(() => UserSubscriptionWhereInputSchema).optional(),
  some: z.lazy(() => UserSubscriptionWhereInputSchema).optional(),
  none: z.lazy(() => UserSubscriptionWhereInputSchema).optional()
}).strict();

export const BlogPostListRelationFilterSchema: z.ZodType<Prisma.BlogPostListRelationFilter> = z.object({
  every: z.lazy(() => BlogPostWhereInputSchema).optional(),
  some: z.lazy(() => BlogPostWhereInputSchema).optional(),
  none: z.lazy(() => BlogPostWhereInputSchema).optional()
}).strict();

export const SortOrderInputSchema: z.ZodType<Prisma.SortOrderInput> = z.object({
  sort: z.lazy(() => SortOrderSchema),
  nulls: z.lazy(() => NullsOrderSchema).optional()
}).strict();

export const SessionOrderByRelationAggregateInputSchema: z.ZodType<Prisma.SessionOrderByRelationAggregateInput> = z.object({
  _count: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const AccountOrderByRelationAggregateInputSchema: z.ZodType<Prisma.AccountOrderByRelationAggregateInput> = z.object({
  _count: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const PasskeyOrderByRelationAggregateInputSchema: z.ZodType<Prisma.PasskeyOrderByRelationAggregateInput> = z.object({
  _count: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const InvitationOrderByRelationAggregateInputSchema: z.ZodType<Prisma.InvitationOrderByRelationAggregateInput> = z.object({
  _count: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const PurchaseOrderByRelationAggregateInputSchema: z.ZodType<Prisma.PurchaseOrderByRelationAggregateInput> = z.object({
  _count: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const MemberOrderByRelationAggregateInputSchema: z.ZodType<Prisma.MemberOrderByRelationAggregateInput> = z.object({
  _count: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const AiChatOrderByRelationAggregateInputSchema: z.ZodType<Prisma.AiChatOrderByRelationAggregateInput> = z.object({
  _count: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const UserSubscriptionOrderByRelationAggregateInputSchema: z.ZodType<Prisma.UserSubscriptionOrderByRelationAggregateInput> = z.object({
  _count: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const BlogPostOrderByRelationAggregateInputSchema: z.ZodType<Prisma.BlogPostOrderByRelationAggregateInput> = z.object({
  _count: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const UserCountOrderByAggregateInputSchema: z.ZodType<Prisma.UserCountOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  email: z.lazy(() => SortOrderSchema).optional(),
  emailVerified: z.lazy(() => SortOrderSchema).optional(),
  image: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  username: z.lazy(() => SortOrderSchema).optional(),
  role: z.lazy(() => SortOrderSchema).optional(),
  banned: z.lazy(() => SortOrderSchema).optional(),
  banReason: z.lazy(() => SortOrderSchema).optional(),
  banExpires: z.lazy(() => SortOrderSchema).optional(),
  onboardingComplete: z.lazy(() => SortOrderSchema).optional(),
  paymentsCustomerId: z.lazy(() => SortOrderSchema).optional(),
  locale: z.lazy(() => SortOrderSchema).optional(),
  membershipLevel: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const UserMaxOrderByAggregateInputSchema: z.ZodType<Prisma.UserMaxOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  email: z.lazy(() => SortOrderSchema).optional(),
  emailVerified: z.lazy(() => SortOrderSchema).optional(),
  image: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  username: z.lazy(() => SortOrderSchema).optional(),
  role: z.lazy(() => SortOrderSchema).optional(),
  banned: z.lazy(() => SortOrderSchema).optional(),
  banReason: z.lazy(() => SortOrderSchema).optional(),
  banExpires: z.lazy(() => SortOrderSchema).optional(),
  onboardingComplete: z.lazy(() => SortOrderSchema).optional(),
  paymentsCustomerId: z.lazy(() => SortOrderSchema).optional(),
  locale: z.lazy(() => SortOrderSchema).optional(),
  membershipLevel: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const UserMinOrderByAggregateInputSchema: z.ZodType<Prisma.UserMinOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  email: z.lazy(() => SortOrderSchema).optional(),
  emailVerified: z.lazy(() => SortOrderSchema).optional(),
  image: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  username: z.lazy(() => SortOrderSchema).optional(),
  role: z.lazy(() => SortOrderSchema).optional(),
  banned: z.lazy(() => SortOrderSchema).optional(),
  banReason: z.lazy(() => SortOrderSchema).optional(),
  banExpires: z.lazy(() => SortOrderSchema).optional(),
  onboardingComplete: z.lazy(() => SortOrderSchema).optional(),
  paymentsCustomerId: z.lazy(() => SortOrderSchema).optional(),
  locale: z.lazy(() => SortOrderSchema).optional(),
  membershipLevel: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const StringWithAggregatesFilterSchema: z.ZodType<Prisma.StringWithAggregatesFilter> = z.object({
  equals: z.string().optional(),
  in: z.string().array().optional(),
  notIn: z.string().array().optional(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  mode: z.lazy(() => QueryModeSchema).optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedStringFilterSchema).optional(),
  _max: z.lazy(() => NestedStringFilterSchema).optional()
}).strict();

export const BoolWithAggregatesFilterSchema: z.ZodType<Prisma.BoolWithAggregatesFilter> = z.object({
  equals: z.boolean().optional(),
  not: z.union([ z.boolean(),z.lazy(() => NestedBoolWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedBoolFilterSchema).optional(),
  _max: z.lazy(() => NestedBoolFilterSchema).optional()
}).strict();

export const StringNullableWithAggregatesFilterSchema: z.ZodType<Prisma.StringNullableWithAggregatesFilter> = z.object({
  equals: z.string().optional().nullable(),
  in: z.string().array().optional().nullable(),
  notIn: z.string().array().optional().nullable(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  mode: z.lazy(() => QueryModeSchema).optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringNullableWithAggregatesFilterSchema) ]).optional().nullable(),
  _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _min: z.lazy(() => NestedStringNullableFilterSchema).optional(),
  _max: z.lazy(() => NestedStringNullableFilterSchema).optional()
}).strict();

export const DateTimeWithAggregatesFilterSchema: z.ZodType<Prisma.DateTimeWithAggregatesFilter> = z.object({
  equals: z.coerce.date().optional(),
  in: z.coerce.date().array().optional(),
  notIn: z.coerce.date().array().optional(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  not: z.union([ z.coerce.date(),z.lazy(() => NestedDateTimeWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedDateTimeFilterSchema).optional(),
  _max: z.lazy(() => NestedDateTimeFilterSchema).optional()
}).strict();

export const BoolNullableWithAggregatesFilterSchema: z.ZodType<Prisma.BoolNullableWithAggregatesFilter> = z.object({
  equals: z.boolean().optional().nullable(),
  not: z.union([ z.boolean(),z.lazy(() => NestedBoolNullableWithAggregatesFilterSchema) ]).optional().nullable(),
  _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _min: z.lazy(() => NestedBoolNullableFilterSchema).optional(),
  _max: z.lazy(() => NestedBoolNullableFilterSchema).optional()
}).strict();

export const DateTimeNullableWithAggregatesFilterSchema: z.ZodType<Prisma.DateTimeNullableWithAggregatesFilter> = z.object({
  equals: z.coerce.date().optional().nullable(),
  in: z.coerce.date().array().optional().nullable(),
  notIn: z.coerce.date().array().optional().nullable(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  not: z.union([ z.coerce.date(),z.lazy(() => NestedDateTimeNullableWithAggregatesFilterSchema) ]).optional().nullable(),
  _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _min: z.lazy(() => NestedDateTimeNullableFilterSchema).optional(),
  _max: z.lazy(() => NestedDateTimeNullableFilterSchema).optional()
}).strict();

export const EnumMembershipLevelWithAggregatesFilterSchema: z.ZodType<Prisma.EnumMembershipLevelWithAggregatesFilter> = z.object({
  equals: z.lazy(() => MembershipLevelSchema).optional(),
  in: z.lazy(() => MembershipLevelSchema).array().optional(),
  notIn: z.lazy(() => MembershipLevelSchema).array().optional(),
  not: z.union([ z.lazy(() => MembershipLevelSchema),z.lazy(() => NestedEnumMembershipLevelWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumMembershipLevelFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumMembershipLevelFilterSchema).optional()
}).strict();

export const UserScalarRelationFilterSchema: z.ZodType<Prisma.UserScalarRelationFilter> = z.object({
  is: z.lazy(() => UserWhereInputSchema).optional(),
  isNot: z.lazy(() => UserWhereInputSchema).optional()
}).strict();

export const SessionCountOrderByAggregateInputSchema: z.ZodType<Prisma.SessionCountOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  expiresAt: z.lazy(() => SortOrderSchema).optional(),
  ipAddress: z.lazy(() => SortOrderSchema).optional(),
  userAgent: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  impersonatedBy: z.lazy(() => SortOrderSchema).optional(),
  activeOrganizationId: z.lazy(() => SortOrderSchema).optional(),
  token: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const SessionMaxOrderByAggregateInputSchema: z.ZodType<Prisma.SessionMaxOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  expiresAt: z.lazy(() => SortOrderSchema).optional(),
  ipAddress: z.lazy(() => SortOrderSchema).optional(),
  userAgent: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  impersonatedBy: z.lazy(() => SortOrderSchema).optional(),
  activeOrganizationId: z.lazy(() => SortOrderSchema).optional(),
  token: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const SessionMinOrderByAggregateInputSchema: z.ZodType<Prisma.SessionMinOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  expiresAt: z.lazy(() => SortOrderSchema).optional(),
  ipAddress: z.lazy(() => SortOrderSchema).optional(),
  userAgent: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  impersonatedBy: z.lazy(() => SortOrderSchema).optional(),
  activeOrganizationId: z.lazy(() => SortOrderSchema).optional(),
  token: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const AccountCountOrderByAggregateInputSchema: z.ZodType<Prisma.AccountCountOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  accountId: z.lazy(() => SortOrderSchema).optional(),
  providerId: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  accessToken: z.lazy(() => SortOrderSchema).optional(),
  refreshToken: z.lazy(() => SortOrderSchema).optional(),
  idToken: z.lazy(() => SortOrderSchema).optional(),
  expiresAt: z.lazy(() => SortOrderSchema).optional(),
  password: z.lazy(() => SortOrderSchema).optional(),
  accessTokenExpiresAt: z.lazy(() => SortOrderSchema).optional(),
  refreshTokenExpiresAt: z.lazy(() => SortOrderSchema).optional(),
  scope: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const AccountMaxOrderByAggregateInputSchema: z.ZodType<Prisma.AccountMaxOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  accountId: z.lazy(() => SortOrderSchema).optional(),
  providerId: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  accessToken: z.lazy(() => SortOrderSchema).optional(),
  refreshToken: z.lazy(() => SortOrderSchema).optional(),
  idToken: z.lazy(() => SortOrderSchema).optional(),
  expiresAt: z.lazy(() => SortOrderSchema).optional(),
  password: z.lazy(() => SortOrderSchema).optional(),
  accessTokenExpiresAt: z.lazy(() => SortOrderSchema).optional(),
  refreshTokenExpiresAt: z.lazy(() => SortOrderSchema).optional(),
  scope: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const AccountMinOrderByAggregateInputSchema: z.ZodType<Prisma.AccountMinOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  accountId: z.lazy(() => SortOrderSchema).optional(),
  providerId: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  accessToken: z.lazy(() => SortOrderSchema).optional(),
  refreshToken: z.lazy(() => SortOrderSchema).optional(),
  idToken: z.lazy(() => SortOrderSchema).optional(),
  expiresAt: z.lazy(() => SortOrderSchema).optional(),
  password: z.lazy(() => SortOrderSchema).optional(),
  accessTokenExpiresAt: z.lazy(() => SortOrderSchema).optional(),
  refreshTokenExpiresAt: z.lazy(() => SortOrderSchema).optional(),
  scope: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const VerificationCountOrderByAggregateInputSchema: z.ZodType<Prisma.VerificationCountOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  identifier: z.lazy(() => SortOrderSchema).optional(),
  value: z.lazy(() => SortOrderSchema).optional(),
  expiresAt: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const VerificationMaxOrderByAggregateInputSchema: z.ZodType<Prisma.VerificationMaxOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  identifier: z.lazy(() => SortOrderSchema).optional(),
  value: z.lazy(() => SortOrderSchema).optional(),
  expiresAt: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const VerificationMinOrderByAggregateInputSchema: z.ZodType<Prisma.VerificationMinOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  identifier: z.lazy(() => SortOrderSchema).optional(),
  value: z.lazy(() => SortOrderSchema).optional(),
  expiresAt: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const IntFilterSchema: z.ZodType<Prisma.IntFilter> = z.object({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntFilterSchema) ]).optional(),
}).strict();

export const PasskeyCountOrderByAggregateInputSchema: z.ZodType<Prisma.PasskeyCountOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  publicKey: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  credentialID: z.lazy(() => SortOrderSchema).optional(),
  counter: z.lazy(() => SortOrderSchema).optional(),
  deviceType: z.lazy(() => SortOrderSchema).optional(),
  backedUp: z.lazy(() => SortOrderSchema).optional(),
  transports: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const PasskeyAvgOrderByAggregateInputSchema: z.ZodType<Prisma.PasskeyAvgOrderByAggregateInput> = z.object({
  counter: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const PasskeyMaxOrderByAggregateInputSchema: z.ZodType<Prisma.PasskeyMaxOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  publicKey: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  credentialID: z.lazy(() => SortOrderSchema).optional(),
  counter: z.lazy(() => SortOrderSchema).optional(),
  deviceType: z.lazy(() => SortOrderSchema).optional(),
  backedUp: z.lazy(() => SortOrderSchema).optional(),
  transports: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const PasskeyMinOrderByAggregateInputSchema: z.ZodType<Prisma.PasskeyMinOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  publicKey: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  credentialID: z.lazy(() => SortOrderSchema).optional(),
  counter: z.lazy(() => SortOrderSchema).optional(),
  deviceType: z.lazy(() => SortOrderSchema).optional(),
  backedUp: z.lazy(() => SortOrderSchema).optional(),
  transports: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const PasskeySumOrderByAggregateInputSchema: z.ZodType<Prisma.PasskeySumOrderByAggregateInput> = z.object({
  counter: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const IntWithAggregatesFilterSchema: z.ZodType<Prisma.IntWithAggregatesFilter> = z.object({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _avg: z.lazy(() => NestedFloatFilterSchema).optional(),
  _sum: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedIntFilterSchema).optional(),
  _max: z.lazy(() => NestedIntFilterSchema).optional()
}).strict();

export const OrganizationCountOrderByAggregateInputSchema: z.ZodType<Prisma.OrganizationCountOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  slug: z.lazy(() => SortOrderSchema).optional(),
  logo: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  metadata: z.lazy(() => SortOrderSchema).optional(),
  paymentsCustomerId: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const OrganizationMaxOrderByAggregateInputSchema: z.ZodType<Prisma.OrganizationMaxOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  slug: z.lazy(() => SortOrderSchema).optional(),
  logo: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  metadata: z.lazy(() => SortOrderSchema).optional(),
  paymentsCustomerId: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const OrganizationMinOrderByAggregateInputSchema: z.ZodType<Prisma.OrganizationMinOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  slug: z.lazy(() => SortOrderSchema).optional(),
  logo: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  metadata: z.lazy(() => SortOrderSchema).optional(),
  paymentsCustomerId: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const OrganizationScalarRelationFilterSchema: z.ZodType<Prisma.OrganizationScalarRelationFilter> = z.object({
  is: z.lazy(() => OrganizationWhereInputSchema).optional(),
  isNot: z.lazy(() => OrganizationWhereInputSchema).optional()
}).strict();

export const MemberOrganizationIdUserIdCompoundUniqueInputSchema: z.ZodType<Prisma.MemberOrganizationIdUserIdCompoundUniqueInput> = z.object({
  organizationId: z.string(),
  userId: z.string()
}).strict();

export const MemberCountOrderByAggregateInputSchema: z.ZodType<Prisma.MemberCountOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  organizationId: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  role: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const MemberMaxOrderByAggregateInputSchema: z.ZodType<Prisma.MemberMaxOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  organizationId: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  role: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const MemberMinOrderByAggregateInputSchema: z.ZodType<Prisma.MemberMinOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  organizationId: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  role: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const InvitationCountOrderByAggregateInputSchema: z.ZodType<Prisma.InvitationCountOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  organizationId: z.lazy(() => SortOrderSchema).optional(),
  email: z.lazy(() => SortOrderSchema).optional(),
  role: z.lazy(() => SortOrderSchema).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  expiresAt: z.lazy(() => SortOrderSchema).optional(),
  inviterId: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const InvitationMaxOrderByAggregateInputSchema: z.ZodType<Prisma.InvitationMaxOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  organizationId: z.lazy(() => SortOrderSchema).optional(),
  email: z.lazy(() => SortOrderSchema).optional(),
  role: z.lazy(() => SortOrderSchema).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  expiresAt: z.lazy(() => SortOrderSchema).optional(),
  inviterId: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const InvitationMinOrderByAggregateInputSchema: z.ZodType<Prisma.InvitationMinOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  organizationId: z.lazy(() => SortOrderSchema).optional(),
  email: z.lazy(() => SortOrderSchema).optional(),
  role: z.lazy(() => SortOrderSchema).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  expiresAt: z.lazy(() => SortOrderSchema).optional(),
  inviterId: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const EnumPurchaseTypeFilterSchema: z.ZodType<Prisma.EnumPurchaseTypeFilter> = z.object({
  equals: z.lazy(() => PurchaseTypeSchema).optional(),
  in: z.lazy(() => PurchaseTypeSchema).array().optional(),
  notIn: z.lazy(() => PurchaseTypeSchema).array().optional(),
  not: z.union([ z.lazy(() => PurchaseTypeSchema),z.lazy(() => NestedEnumPurchaseTypeFilterSchema) ]).optional(),
}).strict();

export const OrganizationNullableScalarRelationFilterSchema: z.ZodType<Prisma.OrganizationNullableScalarRelationFilter> = z.object({
  is: z.lazy(() => OrganizationWhereInputSchema).optional().nullable(),
  isNot: z.lazy(() => OrganizationWhereInputSchema).optional().nullable()
}).strict();

export const UserNullableScalarRelationFilterSchema: z.ZodType<Prisma.UserNullableScalarRelationFilter> = z.object({
  is: z.lazy(() => UserWhereInputSchema).optional().nullable(),
  isNot: z.lazy(() => UserWhereInputSchema).optional().nullable()
}).strict();

export const PurchaseCountOrderByAggregateInputSchema: z.ZodType<Prisma.PurchaseCountOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  organizationId: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  type: z.lazy(() => SortOrderSchema).optional(),
  customerId: z.lazy(() => SortOrderSchema).optional(),
  subscriptionId: z.lazy(() => SortOrderSchema).optional(),
  productId: z.lazy(() => SortOrderSchema).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const PurchaseMaxOrderByAggregateInputSchema: z.ZodType<Prisma.PurchaseMaxOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  organizationId: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  type: z.lazy(() => SortOrderSchema).optional(),
  customerId: z.lazy(() => SortOrderSchema).optional(),
  subscriptionId: z.lazy(() => SortOrderSchema).optional(),
  productId: z.lazy(() => SortOrderSchema).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const PurchaseMinOrderByAggregateInputSchema: z.ZodType<Prisma.PurchaseMinOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  organizationId: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  type: z.lazy(() => SortOrderSchema).optional(),
  customerId: z.lazy(() => SortOrderSchema).optional(),
  subscriptionId: z.lazy(() => SortOrderSchema).optional(),
  productId: z.lazy(() => SortOrderSchema).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const EnumPurchaseTypeWithAggregatesFilterSchema: z.ZodType<Prisma.EnumPurchaseTypeWithAggregatesFilter> = z.object({
  equals: z.lazy(() => PurchaseTypeSchema).optional(),
  in: z.lazy(() => PurchaseTypeSchema).array().optional(),
  notIn: z.lazy(() => PurchaseTypeSchema).array().optional(),
  not: z.union([ z.lazy(() => PurchaseTypeSchema),z.lazy(() => NestedEnumPurchaseTypeWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumPurchaseTypeFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumPurchaseTypeFilterSchema).optional()
}).strict();

export const JsonFilterSchema: z.ZodType<Prisma.JsonFilter> = z.object({
  equals: InputJsonValueSchema.optional(),
  path: z.string().array().optional(),
  mode: z.lazy(() => QueryModeSchema).optional(),
  string_contains: z.string().optional(),
  string_starts_with: z.string().optional(),
  string_ends_with: z.string().optional(),
  array_starts_with: InputJsonValueSchema.optional().nullable(),
  array_ends_with: InputJsonValueSchema.optional().nullable(),
  array_contains: InputJsonValueSchema.optional().nullable(),
  lt: InputJsonValueSchema.optional(),
  lte: InputJsonValueSchema.optional(),
  gt: InputJsonValueSchema.optional(),
  gte: InputJsonValueSchema.optional(),
  not: InputJsonValueSchema.optional()
}).strict();

export const AiChatCountOrderByAggregateInputSchema: z.ZodType<Prisma.AiChatCountOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  organizationId: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  title: z.lazy(() => SortOrderSchema).optional(),
  messages: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const AiChatMaxOrderByAggregateInputSchema: z.ZodType<Prisma.AiChatMaxOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  organizationId: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  title: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const AiChatMinOrderByAggregateInputSchema: z.ZodType<Prisma.AiChatMinOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  organizationId: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  title: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const JsonWithAggregatesFilterSchema: z.ZodType<Prisma.JsonWithAggregatesFilter> = z.object({
  equals: InputJsonValueSchema.optional(),
  path: z.string().array().optional(),
  mode: z.lazy(() => QueryModeSchema).optional(),
  string_contains: z.string().optional(),
  string_starts_with: z.string().optional(),
  string_ends_with: z.string().optional(),
  array_starts_with: InputJsonValueSchema.optional().nullable(),
  array_ends_with: InputJsonValueSchema.optional().nullable(),
  array_contains: InputJsonValueSchema.optional().nullable(),
  lt: InputJsonValueSchema.optional(),
  lte: InputJsonValueSchema.optional(),
  gt: InputJsonValueSchema.optional(),
  gte: InputJsonValueSchema.optional(),
  not: InputJsonValueSchema.optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedJsonFilterSchema).optional(),
  _max: z.lazy(() => NestedJsonFilterSchema).optional()
}).strict();

export const EnumAccessLevelFilterSchema: z.ZodType<Prisma.EnumAccessLevelFilter> = z.object({
  equals: z.lazy(() => AccessLevelSchema).optional(),
  in: z.lazy(() => AccessLevelSchema).array().optional(),
  notIn: z.lazy(() => AccessLevelSchema).array().optional(),
  not: z.union([ z.lazy(() => AccessLevelSchema),z.lazy(() => NestedEnumAccessLevelFilterSchema) ]).optional(),
}).strict();

export const StringNullableListFilterSchema: z.ZodType<Prisma.StringNullableListFilter> = z.object({
  equals: z.string().array().optional().nullable(),
  has: z.string().optional().nullable(),
  hasEvery: z.string().array().optional(),
  hasSome: z.string().array().optional(),
  isEmpty: z.boolean().optional()
}).strict();

export const BlogCategoryListRelationFilterSchema: z.ZodType<Prisma.BlogCategoryListRelationFilter> = z.object({
  every: z.lazy(() => BlogCategoryWhereInputSchema).optional(),
  some: z.lazy(() => BlogCategoryWhereInputSchema).optional(),
  none: z.lazy(() => BlogCategoryWhereInputSchema).optional()
}).strict();

export const BlogCategoryOrderByRelationAggregateInputSchema: z.ZodType<Prisma.BlogCategoryOrderByRelationAggregateInput> = z.object({
  _count: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const BlogPostCountOrderByAggregateInputSchema: z.ZodType<Prisma.BlogPostCountOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  slug: z.lazy(() => SortOrderSchema).optional(),
  title: z.lazy(() => SortOrderSchema).optional(),
  excerpt: z.lazy(() => SortOrderSchema).optional(),
  content: z.lazy(() => SortOrderSchema).optional(),
  image: z.lazy(() => SortOrderSchema).optional(),
  authorId: z.lazy(() => SortOrderSchema).optional(),
  accessLevel: z.lazy(() => SortOrderSchema).optional(),
  previewContent: z.lazy(() => SortOrderSchema).optional(),
  tags: z.lazy(() => SortOrderSchema).optional(),
  published: z.lazy(() => SortOrderSchema).optional(),
  publishedAt: z.lazy(() => SortOrderSchema).optional(),
  viewCount: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const BlogPostAvgOrderByAggregateInputSchema: z.ZodType<Prisma.BlogPostAvgOrderByAggregateInput> = z.object({
  viewCount: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const BlogPostMaxOrderByAggregateInputSchema: z.ZodType<Prisma.BlogPostMaxOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  slug: z.lazy(() => SortOrderSchema).optional(),
  title: z.lazy(() => SortOrderSchema).optional(),
  excerpt: z.lazy(() => SortOrderSchema).optional(),
  content: z.lazy(() => SortOrderSchema).optional(),
  image: z.lazy(() => SortOrderSchema).optional(),
  authorId: z.lazy(() => SortOrderSchema).optional(),
  accessLevel: z.lazy(() => SortOrderSchema).optional(),
  previewContent: z.lazy(() => SortOrderSchema).optional(),
  published: z.lazy(() => SortOrderSchema).optional(),
  publishedAt: z.lazy(() => SortOrderSchema).optional(),
  viewCount: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const BlogPostMinOrderByAggregateInputSchema: z.ZodType<Prisma.BlogPostMinOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  slug: z.lazy(() => SortOrderSchema).optional(),
  title: z.lazy(() => SortOrderSchema).optional(),
  excerpt: z.lazy(() => SortOrderSchema).optional(),
  content: z.lazy(() => SortOrderSchema).optional(),
  image: z.lazy(() => SortOrderSchema).optional(),
  authorId: z.lazy(() => SortOrderSchema).optional(),
  accessLevel: z.lazy(() => SortOrderSchema).optional(),
  previewContent: z.lazy(() => SortOrderSchema).optional(),
  published: z.lazy(() => SortOrderSchema).optional(),
  publishedAt: z.lazy(() => SortOrderSchema).optional(),
  viewCount: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const BlogPostSumOrderByAggregateInputSchema: z.ZodType<Prisma.BlogPostSumOrderByAggregateInput> = z.object({
  viewCount: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const EnumAccessLevelWithAggregatesFilterSchema: z.ZodType<Prisma.EnumAccessLevelWithAggregatesFilter> = z.object({
  equals: z.lazy(() => AccessLevelSchema).optional(),
  in: z.lazy(() => AccessLevelSchema).array().optional(),
  notIn: z.lazy(() => AccessLevelSchema).array().optional(),
  not: z.union([ z.lazy(() => AccessLevelSchema),z.lazy(() => NestedEnumAccessLevelWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumAccessLevelFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumAccessLevelFilterSchema).optional()
}).strict();

export const DecimalFilterSchema: z.ZodType<Prisma.DecimalFilter> = z.object({
  equals: z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  in: z.union([z.number().array(),z.string().array(),z.instanceof(Decimal).array(),z.instanceof(Prisma.Decimal).array(),DecimalJsLikeSchema.array(),]).refine((v) => Array.isArray(v) && (v as any[]).every((v) => isValidDecimalInput(v)), { message: 'Must be a Decimal' }).optional(),
  notIn: z.union([z.number().array(),z.string().array(),z.instanceof(Decimal).array(),z.instanceof(Prisma.Decimal).array(),DecimalJsLikeSchema.array(),]).refine((v) => Array.isArray(v) && (v as any[]).every((v) => isValidDecimalInput(v)), { message: 'Must be a Decimal' }).optional(),
  lt: z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  lte: z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  gt: z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  gte: z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  not: z.union([ z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => NestedDecimalFilterSchema) ]).optional(),
}).strict();

export const EnumPlanIntervalFilterSchema: z.ZodType<Prisma.EnumPlanIntervalFilter> = z.object({
  equals: z.lazy(() => PlanIntervalSchema).optional(),
  in: z.lazy(() => PlanIntervalSchema).array().optional(),
  notIn: z.lazy(() => PlanIntervalSchema).array().optional(),
  not: z.union([ z.lazy(() => PlanIntervalSchema),z.lazy(() => NestedEnumPlanIntervalFilterSchema) ]).optional(),
}).strict();

export const SubscriptionPlanCountOrderByAggregateInputSchema: z.ZodType<Prisma.SubscriptionPlanCountOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  slug: z.lazy(() => SortOrderSchema).optional(),
  description: z.lazy(() => SortOrderSchema).optional(),
  price: z.lazy(() => SortOrderSchema).optional(),
  currency: z.lazy(() => SortOrderSchema).optional(),
  interval: z.lazy(() => SortOrderSchema).optional(),
  intervalCount: z.lazy(() => SortOrderSchema).optional(),
  features: z.lazy(() => SortOrderSchema).optional(),
  active: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const SubscriptionPlanAvgOrderByAggregateInputSchema: z.ZodType<Prisma.SubscriptionPlanAvgOrderByAggregateInput> = z.object({
  price: z.lazy(() => SortOrderSchema).optional(),
  intervalCount: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const SubscriptionPlanMaxOrderByAggregateInputSchema: z.ZodType<Prisma.SubscriptionPlanMaxOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  slug: z.lazy(() => SortOrderSchema).optional(),
  description: z.lazy(() => SortOrderSchema).optional(),
  price: z.lazy(() => SortOrderSchema).optional(),
  currency: z.lazy(() => SortOrderSchema).optional(),
  interval: z.lazy(() => SortOrderSchema).optional(),
  intervalCount: z.lazy(() => SortOrderSchema).optional(),
  active: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const SubscriptionPlanMinOrderByAggregateInputSchema: z.ZodType<Prisma.SubscriptionPlanMinOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  slug: z.lazy(() => SortOrderSchema).optional(),
  description: z.lazy(() => SortOrderSchema).optional(),
  price: z.lazy(() => SortOrderSchema).optional(),
  currency: z.lazy(() => SortOrderSchema).optional(),
  interval: z.lazy(() => SortOrderSchema).optional(),
  intervalCount: z.lazy(() => SortOrderSchema).optional(),
  active: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const SubscriptionPlanSumOrderByAggregateInputSchema: z.ZodType<Prisma.SubscriptionPlanSumOrderByAggregateInput> = z.object({
  price: z.lazy(() => SortOrderSchema).optional(),
  intervalCount: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const DecimalWithAggregatesFilterSchema: z.ZodType<Prisma.DecimalWithAggregatesFilter> = z.object({
  equals: z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  in: z.union([z.number().array(),z.string().array(),z.instanceof(Decimal).array(),z.instanceof(Prisma.Decimal).array(),DecimalJsLikeSchema.array(),]).refine((v) => Array.isArray(v) && (v as any[]).every((v) => isValidDecimalInput(v)), { message: 'Must be a Decimal' }).optional(),
  notIn: z.union([z.number().array(),z.string().array(),z.instanceof(Decimal).array(),z.instanceof(Prisma.Decimal).array(),DecimalJsLikeSchema.array(),]).refine((v) => Array.isArray(v) && (v as any[]).every((v) => isValidDecimalInput(v)), { message: 'Must be a Decimal' }).optional(),
  lt: z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  lte: z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  gt: z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  gte: z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  not: z.union([ z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => NestedDecimalWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _avg: z.lazy(() => NestedDecimalFilterSchema).optional(),
  _sum: z.lazy(() => NestedDecimalFilterSchema).optional(),
  _min: z.lazy(() => NestedDecimalFilterSchema).optional(),
  _max: z.lazy(() => NestedDecimalFilterSchema).optional()
}).strict();

export const EnumPlanIntervalWithAggregatesFilterSchema: z.ZodType<Prisma.EnumPlanIntervalWithAggregatesFilter> = z.object({
  equals: z.lazy(() => PlanIntervalSchema).optional(),
  in: z.lazy(() => PlanIntervalSchema).array().optional(),
  notIn: z.lazy(() => PlanIntervalSchema).array().optional(),
  not: z.union([ z.lazy(() => PlanIntervalSchema),z.lazy(() => NestedEnumPlanIntervalWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumPlanIntervalFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumPlanIntervalFilterSchema).optional()
}).strict();

export const EnumSubscriptionStatusFilterSchema: z.ZodType<Prisma.EnumSubscriptionStatusFilter> = z.object({
  equals: z.lazy(() => SubscriptionStatusSchema).optional(),
  in: z.lazy(() => SubscriptionStatusSchema).array().optional(),
  notIn: z.lazy(() => SubscriptionStatusSchema).array().optional(),
  not: z.union([ z.lazy(() => SubscriptionStatusSchema),z.lazy(() => NestedEnumSubscriptionStatusFilterSchema) ]).optional(),
}).strict();

export const SubscriptionPlanScalarRelationFilterSchema: z.ZodType<Prisma.SubscriptionPlanScalarRelationFilter> = z.object({
  is: z.lazy(() => SubscriptionPlanWhereInputSchema).optional(),
  isNot: z.lazy(() => SubscriptionPlanWhereInputSchema).optional()
}).strict();

export const UserSubscriptionUserIdPlanIdStatusCompoundUniqueInputSchema: z.ZodType<Prisma.UserSubscriptionUserIdPlanIdStatusCompoundUniqueInput> = z.object({
  userId: z.string(),
  planId: z.string(),
  status: z.lazy(() => SubscriptionStatusSchema)
}).strict();

export const UserSubscriptionCountOrderByAggregateInputSchema: z.ZodType<Prisma.UserSubscriptionCountOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  planId: z.lazy(() => SortOrderSchema).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  startDate: z.lazy(() => SortOrderSchema).optional(),
  endDate: z.lazy(() => SortOrderSchema).optional(),
  cancelledAt: z.lazy(() => SortOrderSchema).optional(),
  paymentId: z.lazy(() => SortOrderSchema).optional(),
  paymentMethod: z.lazy(() => SortOrderSchema).optional(),
  amount: z.lazy(() => SortOrderSchema).optional(),
  autoRenew: z.lazy(() => SortOrderSchema).optional(),
  nextBillingDate: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const UserSubscriptionAvgOrderByAggregateInputSchema: z.ZodType<Prisma.UserSubscriptionAvgOrderByAggregateInput> = z.object({
  amount: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const UserSubscriptionMaxOrderByAggregateInputSchema: z.ZodType<Prisma.UserSubscriptionMaxOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  planId: z.lazy(() => SortOrderSchema).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  startDate: z.lazy(() => SortOrderSchema).optional(),
  endDate: z.lazy(() => SortOrderSchema).optional(),
  cancelledAt: z.lazy(() => SortOrderSchema).optional(),
  paymentId: z.lazy(() => SortOrderSchema).optional(),
  paymentMethod: z.lazy(() => SortOrderSchema).optional(),
  amount: z.lazy(() => SortOrderSchema).optional(),
  autoRenew: z.lazy(() => SortOrderSchema).optional(),
  nextBillingDate: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const UserSubscriptionMinOrderByAggregateInputSchema: z.ZodType<Prisma.UserSubscriptionMinOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  planId: z.lazy(() => SortOrderSchema).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  startDate: z.lazy(() => SortOrderSchema).optional(),
  endDate: z.lazy(() => SortOrderSchema).optional(),
  cancelledAt: z.lazy(() => SortOrderSchema).optional(),
  paymentId: z.lazy(() => SortOrderSchema).optional(),
  paymentMethod: z.lazy(() => SortOrderSchema).optional(),
  amount: z.lazy(() => SortOrderSchema).optional(),
  autoRenew: z.lazy(() => SortOrderSchema).optional(),
  nextBillingDate: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const UserSubscriptionSumOrderByAggregateInputSchema: z.ZodType<Prisma.UserSubscriptionSumOrderByAggregateInput> = z.object({
  amount: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const EnumSubscriptionStatusWithAggregatesFilterSchema: z.ZodType<Prisma.EnumSubscriptionStatusWithAggregatesFilter> = z.object({
  equals: z.lazy(() => SubscriptionStatusSchema).optional(),
  in: z.lazy(() => SubscriptionStatusSchema).array().optional(),
  notIn: z.lazy(() => SubscriptionStatusSchema).array().optional(),
  not: z.union([ z.lazy(() => SubscriptionStatusSchema),z.lazy(() => NestedEnumSubscriptionStatusWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumSubscriptionStatusFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumSubscriptionStatusFilterSchema).optional()
}).strict();

export const BlogCategoryCountOrderByAggregateInputSchema: z.ZodType<Prisma.BlogCategoryCountOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  slug: z.lazy(() => SortOrderSchema).optional(),
  description: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const BlogCategoryMaxOrderByAggregateInputSchema: z.ZodType<Prisma.BlogCategoryMaxOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  slug: z.lazy(() => SortOrderSchema).optional(),
  description: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const BlogCategoryMinOrderByAggregateInputSchema: z.ZodType<Prisma.BlogCategoryMinOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  slug: z.lazy(() => SortOrderSchema).optional(),
  description: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const SessionCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.SessionCreateNestedManyWithoutUserInput> = z.object({
  create: z.union([ z.lazy(() => SessionCreateWithoutUserInputSchema),z.lazy(() => SessionCreateWithoutUserInputSchema).array(),z.lazy(() => SessionUncheckedCreateWithoutUserInputSchema),z.lazy(() => SessionUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => SessionCreateOrConnectWithoutUserInputSchema),z.lazy(() => SessionCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => SessionCreateManyUserInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => SessionWhereUniqueInputSchema),z.lazy(() => SessionWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const AccountCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.AccountCreateNestedManyWithoutUserInput> = z.object({
  create: z.union([ z.lazy(() => AccountCreateWithoutUserInputSchema),z.lazy(() => AccountCreateWithoutUserInputSchema).array(),z.lazy(() => AccountUncheckedCreateWithoutUserInputSchema),z.lazy(() => AccountUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => AccountCreateOrConnectWithoutUserInputSchema),z.lazy(() => AccountCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => AccountCreateManyUserInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => AccountWhereUniqueInputSchema),z.lazy(() => AccountWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const PasskeyCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.PasskeyCreateNestedManyWithoutUserInput> = z.object({
  create: z.union([ z.lazy(() => PasskeyCreateWithoutUserInputSchema),z.lazy(() => PasskeyCreateWithoutUserInputSchema).array(),z.lazy(() => PasskeyUncheckedCreateWithoutUserInputSchema),z.lazy(() => PasskeyUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => PasskeyCreateOrConnectWithoutUserInputSchema),z.lazy(() => PasskeyCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => PasskeyCreateManyUserInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => PasskeyWhereUniqueInputSchema),z.lazy(() => PasskeyWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const InvitationCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.InvitationCreateNestedManyWithoutUserInput> = z.object({
  create: z.union([ z.lazy(() => InvitationCreateWithoutUserInputSchema),z.lazy(() => InvitationCreateWithoutUserInputSchema).array(),z.lazy(() => InvitationUncheckedCreateWithoutUserInputSchema),z.lazy(() => InvitationUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => InvitationCreateOrConnectWithoutUserInputSchema),z.lazy(() => InvitationCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => InvitationCreateManyUserInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => InvitationWhereUniqueInputSchema),z.lazy(() => InvitationWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const PurchaseCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.PurchaseCreateNestedManyWithoutUserInput> = z.object({
  create: z.union([ z.lazy(() => PurchaseCreateWithoutUserInputSchema),z.lazy(() => PurchaseCreateWithoutUserInputSchema).array(),z.lazy(() => PurchaseUncheckedCreateWithoutUserInputSchema),z.lazy(() => PurchaseUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => PurchaseCreateOrConnectWithoutUserInputSchema),z.lazy(() => PurchaseCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => PurchaseCreateManyUserInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => PurchaseWhereUniqueInputSchema),z.lazy(() => PurchaseWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const MemberCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.MemberCreateNestedManyWithoutUserInput> = z.object({
  create: z.union([ z.lazy(() => MemberCreateWithoutUserInputSchema),z.lazy(() => MemberCreateWithoutUserInputSchema).array(),z.lazy(() => MemberUncheckedCreateWithoutUserInputSchema),z.lazy(() => MemberUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => MemberCreateOrConnectWithoutUserInputSchema),z.lazy(() => MemberCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => MemberCreateManyUserInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => MemberWhereUniqueInputSchema),z.lazy(() => MemberWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const AiChatCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.AiChatCreateNestedManyWithoutUserInput> = z.object({
  create: z.union([ z.lazy(() => AiChatCreateWithoutUserInputSchema),z.lazy(() => AiChatCreateWithoutUserInputSchema).array(),z.lazy(() => AiChatUncheckedCreateWithoutUserInputSchema),z.lazy(() => AiChatUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => AiChatCreateOrConnectWithoutUserInputSchema),z.lazy(() => AiChatCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => AiChatCreateManyUserInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => AiChatWhereUniqueInputSchema),z.lazy(() => AiChatWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const UserSubscriptionCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.UserSubscriptionCreateNestedManyWithoutUserInput> = z.object({
  create: z.union([ z.lazy(() => UserSubscriptionCreateWithoutUserInputSchema),z.lazy(() => UserSubscriptionCreateWithoutUserInputSchema).array(),z.lazy(() => UserSubscriptionUncheckedCreateWithoutUserInputSchema),z.lazy(() => UserSubscriptionUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => UserSubscriptionCreateOrConnectWithoutUserInputSchema),z.lazy(() => UserSubscriptionCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => UserSubscriptionCreateManyUserInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => UserSubscriptionWhereUniqueInputSchema),z.lazy(() => UserSubscriptionWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const BlogPostCreateNestedManyWithoutAuthorInputSchema: z.ZodType<Prisma.BlogPostCreateNestedManyWithoutAuthorInput> = z.object({
  create: z.union([ z.lazy(() => BlogPostCreateWithoutAuthorInputSchema),z.lazy(() => BlogPostCreateWithoutAuthorInputSchema).array(),z.lazy(() => BlogPostUncheckedCreateWithoutAuthorInputSchema),z.lazy(() => BlogPostUncheckedCreateWithoutAuthorInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => BlogPostCreateOrConnectWithoutAuthorInputSchema),z.lazy(() => BlogPostCreateOrConnectWithoutAuthorInputSchema).array() ]).optional(),
  createMany: z.lazy(() => BlogPostCreateManyAuthorInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => BlogPostWhereUniqueInputSchema),z.lazy(() => BlogPostWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const SessionUncheckedCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.SessionUncheckedCreateNestedManyWithoutUserInput> = z.object({
  create: z.union([ z.lazy(() => SessionCreateWithoutUserInputSchema),z.lazy(() => SessionCreateWithoutUserInputSchema).array(),z.lazy(() => SessionUncheckedCreateWithoutUserInputSchema),z.lazy(() => SessionUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => SessionCreateOrConnectWithoutUserInputSchema),z.lazy(() => SessionCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => SessionCreateManyUserInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => SessionWhereUniqueInputSchema),z.lazy(() => SessionWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const AccountUncheckedCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.AccountUncheckedCreateNestedManyWithoutUserInput> = z.object({
  create: z.union([ z.lazy(() => AccountCreateWithoutUserInputSchema),z.lazy(() => AccountCreateWithoutUserInputSchema).array(),z.lazy(() => AccountUncheckedCreateWithoutUserInputSchema),z.lazy(() => AccountUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => AccountCreateOrConnectWithoutUserInputSchema),z.lazy(() => AccountCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => AccountCreateManyUserInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => AccountWhereUniqueInputSchema),z.lazy(() => AccountWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const PasskeyUncheckedCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.PasskeyUncheckedCreateNestedManyWithoutUserInput> = z.object({
  create: z.union([ z.lazy(() => PasskeyCreateWithoutUserInputSchema),z.lazy(() => PasskeyCreateWithoutUserInputSchema).array(),z.lazy(() => PasskeyUncheckedCreateWithoutUserInputSchema),z.lazy(() => PasskeyUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => PasskeyCreateOrConnectWithoutUserInputSchema),z.lazy(() => PasskeyCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => PasskeyCreateManyUserInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => PasskeyWhereUniqueInputSchema),z.lazy(() => PasskeyWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const InvitationUncheckedCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.InvitationUncheckedCreateNestedManyWithoutUserInput> = z.object({
  create: z.union([ z.lazy(() => InvitationCreateWithoutUserInputSchema),z.lazy(() => InvitationCreateWithoutUserInputSchema).array(),z.lazy(() => InvitationUncheckedCreateWithoutUserInputSchema),z.lazy(() => InvitationUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => InvitationCreateOrConnectWithoutUserInputSchema),z.lazy(() => InvitationCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => InvitationCreateManyUserInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => InvitationWhereUniqueInputSchema),z.lazy(() => InvitationWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const PurchaseUncheckedCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.PurchaseUncheckedCreateNestedManyWithoutUserInput> = z.object({
  create: z.union([ z.lazy(() => PurchaseCreateWithoutUserInputSchema),z.lazy(() => PurchaseCreateWithoutUserInputSchema).array(),z.lazy(() => PurchaseUncheckedCreateWithoutUserInputSchema),z.lazy(() => PurchaseUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => PurchaseCreateOrConnectWithoutUserInputSchema),z.lazy(() => PurchaseCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => PurchaseCreateManyUserInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => PurchaseWhereUniqueInputSchema),z.lazy(() => PurchaseWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const MemberUncheckedCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.MemberUncheckedCreateNestedManyWithoutUserInput> = z.object({
  create: z.union([ z.lazy(() => MemberCreateWithoutUserInputSchema),z.lazy(() => MemberCreateWithoutUserInputSchema).array(),z.lazy(() => MemberUncheckedCreateWithoutUserInputSchema),z.lazy(() => MemberUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => MemberCreateOrConnectWithoutUserInputSchema),z.lazy(() => MemberCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => MemberCreateManyUserInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => MemberWhereUniqueInputSchema),z.lazy(() => MemberWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const AiChatUncheckedCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.AiChatUncheckedCreateNestedManyWithoutUserInput> = z.object({
  create: z.union([ z.lazy(() => AiChatCreateWithoutUserInputSchema),z.lazy(() => AiChatCreateWithoutUserInputSchema).array(),z.lazy(() => AiChatUncheckedCreateWithoutUserInputSchema),z.lazy(() => AiChatUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => AiChatCreateOrConnectWithoutUserInputSchema),z.lazy(() => AiChatCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => AiChatCreateManyUserInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => AiChatWhereUniqueInputSchema),z.lazy(() => AiChatWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const UserSubscriptionUncheckedCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.UserSubscriptionUncheckedCreateNestedManyWithoutUserInput> = z.object({
  create: z.union([ z.lazy(() => UserSubscriptionCreateWithoutUserInputSchema),z.lazy(() => UserSubscriptionCreateWithoutUserInputSchema).array(),z.lazy(() => UserSubscriptionUncheckedCreateWithoutUserInputSchema),z.lazy(() => UserSubscriptionUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => UserSubscriptionCreateOrConnectWithoutUserInputSchema),z.lazy(() => UserSubscriptionCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => UserSubscriptionCreateManyUserInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => UserSubscriptionWhereUniqueInputSchema),z.lazy(() => UserSubscriptionWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const BlogPostUncheckedCreateNestedManyWithoutAuthorInputSchema: z.ZodType<Prisma.BlogPostUncheckedCreateNestedManyWithoutAuthorInput> = z.object({
  create: z.union([ z.lazy(() => BlogPostCreateWithoutAuthorInputSchema),z.lazy(() => BlogPostCreateWithoutAuthorInputSchema).array(),z.lazy(() => BlogPostUncheckedCreateWithoutAuthorInputSchema),z.lazy(() => BlogPostUncheckedCreateWithoutAuthorInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => BlogPostCreateOrConnectWithoutAuthorInputSchema),z.lazy(() => BlogPostCreateOrConnectWithoutAuthorInputSchema).array() ]).optional(),
  createMany: z.lazy(() => BlogPostCreateManyAuthorInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => BlogPostWhereUniqueInputSchema),z.lazy(() => BlogPostWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const StringFieldUpdateOperationsInputSchema: z.ZodType<Prisma.StringFieldUpdateOperationsInput> = z.object({
  set: z.string().optional()
}).strict();

export const BoolFieldUpdateOperationsInputSchema: z.ZodType<Prisma.BoolFieldUpdateOperationsInput> = z.object({
  set: z.boolean().optional()
}).strict();

export const NullableStringFieldUpdateOperationsInputSchema: z.ZodType<Prisma.NullableStringFieldUpdateOperationsInput> = z.object({
  set: z.string().optional().nullable()
}).strict();

export const DateTimeFieldUpdateOperationsInputSchema: z.ZodType<Prisma.DateTimeFieldUpdateOperationsInput> = z.object({
  set: z.coerce.date().optional()
}).strict();

export const NullableBoolFieldUpdateOperationsInputSchema: z.ZodType<Prisma.NullableBoolFieldUpdateOperationsInput> = z.object({
  set: z.boolean().optional().nullable()
}).strict();

export const NullableDateTimeFieldUpdateOperationsInputSchema: z.ZodType<Prisma.NullableDateTimeFieldUpdateOperationsInput> = z.object({
  set: z.coerce.date().optional().nullable()
}).strict();

export const EnumMembershipLevelFieldUpdateOperationsInputSchema: z.ZodType<Prisma.EnumMembershipLevelFieldUpdateOperationsInput> = z.object({
  set: z.lazy(() => MembershipLevelSchema).optional()
}).strict();

export const SessionUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.SessionUpdateManyWithoutUserNestedInput> = z.object({
  create: z.union([ z.lazy(() => SessionCreateWithoutUserInputSchema),z.lazy(() => SessionCreateWithoutUserInputSchema).array(),z.lazy(() => SessionUncheckedCreateWithoutUserInputSchema),z.lazy(() => SessionUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => SessionCreateOrConnectWithoutUserInputSchema),z.lazy(() => SessionCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => SessionUpsertWithWhereUniqueWithoutUserInputSchema),z.lazy(() => SessionUpsertWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => SessionCreateManyUserInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => SessionWhereUniqueInputSchema),z.lazy(() => SessionWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => SessionWhereUniqueInputSchema),z.lazy(() => SessionWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => SessionWhereUniqueInputSchema),z.lazy(() => SessionWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => SessionWhereUniqueInputSchema),z.lazy(() => SessionWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => SessionUpdateWithWhereUniqueWithoutUserInputSchema),z.lazy(() => SessionUpdateWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => SessionUpdateManyWithWhereWithoutUserInputSchema),z.lazy(() => SessionUpdateManyWithWhereWithoutUserInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => SessionScalarWhereInputSchema),z.lazy(() => SessionScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const AccountUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.AccountUpdateManyWithoutUserNestedInput> = z.object({
  create: z.union([ z.lazy(() => AccountCreateWithoutUserInputSchema),z.lazy(() => AccountCreateWithoutUserInputSchema).array(),z.lazy(() => AccountUncheckedCreateWithoutUserInputSchema),z.lazy(() => AccountUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => AccountCreateOrConnectWithoutUserInputSchema),z.lazy(() => AccountCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => AccountUpsertWithWhereUniqueWithoutUserInputSchema),z.lazy(() => AccountUpsertWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => AccountCreateManyUserInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => AccountWhereUniqueInputSchema),z.lazy(() => AccountWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => AccountWhereUniqueInputSchema),z.lazy(() => AccountWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => AccountWhereUniqueInputSchema),z.lazy(() => AccountWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => AccountWhereUniqueInputSchema),z.lazy(() => AccountWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => AccountUpdateWithWhereUniqueWithoutUserInputSchema),z.lazy(() => AccountUpdateWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => AccountUpdateManyWithWhereWithoutUserInputSchema),z.lazy(() => AccountUpdateManyWithWhereWithoutUserInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => AccountScalarWhereInputSchema),z.lazy(() => AccountScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const PasskeyUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.PasskeyUpdateManyWithoutUserNestedInput> = z.object({
  create: z.union([ z.lazy(() => PasskeyCreateWithoutUserInputSchema),z.lazy(() => PasskeyCreateWithoutUserInputSchema).array(),z.lazy(() => PasskeyUncheckedCreateWithoutUserInputSchema),z.lazy(() => PasskeyUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => PasskeyCreateOrConnectWithoutUserInputSchema),z.lazy(() => PasskeyCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => PasskeyUpsertWithWhereUniqueWithoutUserInputSchema),z.lazy(() => PasskeyUpsertWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => PasskeyCreateManyUserInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => PasskeyWhereUniqueInputSchema),z.lazy(() => PasskeyWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => PasskeyWhereUniqueInputSchema),z.lazy(() => PasskeyWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => PasskeyWhereUniqueInputSchema),z.lazy(() => PasskeyWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => PasskeyWhereUniqueInputSchema),z.lazy(() => PasskeyWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => PasskeyUpdateWithWhereUniqueWithoutUserInputSchema),z.lazy(() => PasskeyUpdateWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => PasskeyUpdateManyWithWhereWithoutUserInputSchema),z.lazy(() => PasskeyUpdateManyWithWhereWithoutUserInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => PasskeyScalarWhereInputSchema),z.lazy(() => PasskeyScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const InvitationUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.InvitationUpdateManyWithoutUserNestedInput> = z.object({
  create: z.union([ z.lazy(() => InvitationCreateWithoutUserInputSchema),z.lazy(() => InvitationCreateWithoutUserInputSchema).array(),z.lazy(() => InvitationUncheckedCreateWithoutUserInputSchema),z.lazy(() => InvitationUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => InvitationCreateOrConnectWithoutUserInputSchema),z.lazy(() => InvitationCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => InvitationUpsertWithWhereUniqueWithoutUserInputSchema),z.lazy(() => InvitationUpsertWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => InvitationCreateManyUserInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => InvitationWhereUniqueInputSchema),z.lazy(() => InvitationWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => InvitationWhereUniqueInputSchema),z.lazy(() => InvitationWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => InvitationWhereUniqueInputSchema),z.lazy(() => InvitationWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => InvitationWhereUniqueInputSchema),z.lazy(() => InvitationWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => InvitationUpdateWithWhereUniqueWithoutUserInputSchema),z.lazy(() => InvitationUpdateWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => InvitationUpdateManyWithWhereWithoutUserInputSchema),z.lazy(() => InvitationUpdateManyWithWhereWithoutUserInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => InvitationScalarWhereInputSchema),z.lazy(() => InvitationScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const PurchaseUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.PurchaseUpdateManyWithoutUserNestedInput> = z.object({
  create: z.union([ z.lazy(() => PurchaseCreateWithoutUserInputSchema),z.lazy(() => PurchaseCreateWithoutUserInputSchema).array(),z.lazy(() => PurchaseUncheckedCreateWithoutUserInputSchema),z.lazy(() => PurchaseUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => PurchaseCreateOrConnectWithoutUserInputSchema),z.lazy(() => PurchaseCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => PurchaseUpsertWithWhereUniqueWithoutUserInputSchema),z.lazy(() => PurchaseUpsertWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => PurchaseCreateManyUserInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => PurchaseWhereUniqueInputSchema),z.lazy(() => PurchaseWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => PurchaseWhereUniqueInputSchema),z.lazy(() => PurchaseWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => PurchaseWhereUniqueInputSchema),z.lazy(() => PurchaseWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => PurchaseWhereUniqueInputSchema),z.lazy(() => PurchaseWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => PurchaseUpdateWithWhereUniqueWithoutUserInputSchema),z.lazy(() => PurchaseUpdateWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => PurchaseUpdateManyWithWhereWithoutUserInputSchema),z.lazy(() => PurchaseUpdateManyWithWhereWithoutUserInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => PurchaseScalarWhereInputSchema),z.lazy(() => PurchaseScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const MemberUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.MemberUpdateManyWithoutUserNestedInput> = z.object({
  create: z.union([ z.lazy(() => MemberCreateWithoutUserInputSchema),z.lazy(() => MemberCreateWithoutUserInputSchema).array(),z.lazy(() => MemberUncheckedCreateWithoutUserInputSchema),z.lazy(() => MemberUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => MemberCreateOrConnectWithoutUserInputSchema),z.lazy(() => MemberCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => MemberUpsertWithWhereUniqueWithoutUserInputSchema),z.lazy(() => MemberUpsertWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => MemberCreateManyUserInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => MemberWhereUniqueInputSchema),z.lazy(() => MemberWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => MemberWhereUniqueInputSchema),z.lazy(() => MemberWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => MemberWhereUniqueInputSchema),z.lazy(() => MemberWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => MemberWhereUniqueInputSchema),z.lazy(() => MemberWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => MemberUpdateWithWhereUniqueWithoutUserInputSchema),z.lazy(() => MemberUpdateWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => MemberUpdateManyWithWhereWithoutUserInputSchema),z.lazy(() => MemberUpdateManyWithWhereWithoutUserInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => MemberScalarWhereInputSchema),z.lazy(() => MemberScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const AiChatUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.AiChatUpdateManyWithoutUserNestedInput> = z.object({
  create: z.union([ z.lazy(() => AiChatCreateWithoutUserInputSchema),z.lazy(() => AiChatCreateWithoutUserInputSchema).array(),z.lazy(() => AiChatUncheckedCreateWithoutUserInputSchema),z.lazy(() => AiChatUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => AiChatCreateOrConnectWithoutUserInputSchema),z.lazy(() => AiChatCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => AiChatUpsertWithWhereUniqueWithoutUserInputSchema),z.lazy(() => AiChatUpsertWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => AiChatCreateManyUserInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => AiChatWhereUniqueInputSchema),z.lazy(() => AiChatWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => AiChatWhereUniqueInputSchema),z.lazy(() => AiChatWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => AiChatWhereUniqueInputSchema),z.lazy(() => AiChatWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => AiChatWhereUniqueInputSchema),z.lazy(() => AiChatWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => AiChatUpdateWithWhereUniqueWithoutUserInputSchema),z.lazy(() => AiChatUpdateWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => AiChatUpdateManyWithWhereWithoutUserInputSchema),z.lazy(() => AiChatUpdateManyWithWhereWithoutUserInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => AiChatScalarWhereInputSchema),z.lazy(() => AiChatScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const UserSubscriptionUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.UserSubscriptionUpdateManyWithoutUserNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserSubscriptionCreateWithoutUserInputSchema),z.lazy(() => UserSubscriptionCreateWithoutUserInputSchema).array(),z.lazy(() => UserSubscriptionUncheckedCreateWithoutUserInputSchema),z.lazy(() => UserSubscriptionUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => UserSubscriptionCreateOrConnectWithoutUserInputSchema),z.lazy(() => UserSubscriptionCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => UserSubscriptionUpsertWithWhereUniqueWithoutUserInputSchema),z.lazy(() => UserSubscriptionUpsertWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => UserSubscriptionCreateManyUserInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => UserSubscriptionWhereUniqueInputSchema),z.lazy(() => UserSubscriptionWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => UserSubscriptionWhereUniqueInputSchema),z.lazy(() => UserSubscriptionWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => UserSubscriptionWhereUniqueInputSchema),z.lazy(() => UserSubscriptionWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => UserSubscriptionWhereUniqueInputSchema),z.lazy(() => UserSubscriptionWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => UserSubscriptionUpdateWithWhereUniqueWithoutUserInputSchema),z.lazy(() => UserSubscriptionUpdateWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => UserSubscriptionUpdateManyWithWhereWithoutUserInputSchema),z.lazy(() => UserSubscriptionUpdateManyWithWhereWithoutUserInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => UserSubscriptionScalarWhereInputSchema),z.lazy(() => UserSubscriptionScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const BlogPostUpdateManyWithoutAuthorNestedInputSchema: z.ZodType<Prisma.BlogPostUpdateManyWithoutAuthorNestedInput> = z.object({
  create: z.union([ z.lazy(() => BlogPostCreateWithoutAuthorInputSchema),z.lazy(() => BlogPostCreateWithoutAuthorInputSchema).array(),z.lazy(() => BlogPostUncheckedCreateWithoutAuthorInputSchema),z.lazy(() => BlogPostUncheckedCreateWithoutAuthorInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => BlogPostCreateOrConnectWithoutAuthorInputSchema),z.lazy(() => BlogPostCreateOrConnectWithoutAuthorInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => BlogPostUpsertWithWhereUniqueWithoutAuthorInputSchema),z.lazy(() => BlogPostUpsertWithWhereUniqueWithoutAuthorInputSchema).array() ]).optional(),
  createMany: z.lazy(() => BlogPostCreateManyAuthorInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => BlogPostWhereUniqueInputSchema),z.lazy(() => BlogPostWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => BlogPostWhereUniqueInputSchema),z.lazy(() => BlogPostWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => BlogPostWhereUniqueInputSchema),z.lazy(() => BlogPostWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => BlogPostWhereUniqueInputSchema),z.lazy(() => BlogPostWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => BlogPostUpdateWithWhereUniqueWithoutAuthorInputSchema),z.lazy(() => BlogPostUpdateWithWhereUniqueWithoutAuthorInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => BlogPostUpdateManyWithWhereWithoutAuthorInputSchema),z.lazy(() => BlogPostUpdateManyWithWhereWithoutAuthorInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => BlogPostScalarWhereInputSchema),z.lazy(() => BlogPostScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const SessionUncheckedUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.SessionUncheckedUpdateManyWithoutUserNestedInput> = z.object({
  create: z.union([ z.lazy(() => SessionCreateWithoutUserInputSchema),z.lazy(() => SessionCreateWithoutUserInputSchema).array(),z.lazy(() => SessionUncheckedCreateWithoutUserInputSchema),z.lazy(() => SessionUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => SessionCreateOrConnectWithoutUserInputSchema),z.lazy(() => SessionCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => SessionUpsertWithWhereUniqueWithoutUserInputSchema),z.lazy(() => SessionUpsertWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => SessionCreateManyUserInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => SessionWhereUniqueInputSchema),z.lazy(() => SessionWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => SessionWhereUniqueInputSchema),z.lazy(() => SessionWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => SessionWhereUniqueInputSchema),z.lazy(() => SessionWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => SessionWhereUniqueInputSchema),z.lazy(() => SessionWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => SessionUpdateWithWhereUniqueWithoutUserInputSchema),z.lazy(() => SessionUpdateWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => SessionUpdateManyWithWhereWithoutUserInputSchema),z.lazy(() => SessionUpdateManyWithWhereWithoutUserInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => SessionScalarWhereInputSchema),z.lazy(() => SessionScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const AccountUncheckedUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.AccountUncheckedUpdateManyWithoutUserNestedInput> = z.object({
  create: z.union([ z.lazy(() => AccountCreateWithoutUserInputSchema),z.lazy(() => AccountCreateWithoutUserInputSchema).array(),z.lazy(() => AccountUncheckedCreateWithoutUserInputSchema),z.lazy(() => AccountUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => AccountCreateOrConnectWithoutUserInputSchema),z.lazy(() => AccountCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => AccountUpsertWithWhereUniqueWithoutUserInputSchema),z.lazy(() => AccountUpsertWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => AccountCreateManyUserInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => AccountWhereUniqueInputSchema),z.lazy(() => AccountWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => AccountWhereUniqueInputSchema),z.lazy(() => AccountWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => AccountWhereUniqueInputSchema),z.lazy(() => AccountWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => AccountWhereUniqueInputSchema),z.lazy(() => AccountWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => AccountUpdateWithWhereUniqueWithoutUserInputSchema),z.lazy(() => AccountUpdateWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => AccountUpdateManyWithWhereWithoutUserInputSchema),z.lazy(() => AccountUpdateManyWithWhereWithoutUserInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => AccountScalarWhereInputSchema),z.lazy(() => AccountScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const PasskeyUncheckedUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.PasskeyUncheckedUpdateManyWithoutUserNestedInput> = z.object({
  create: z.union([ z.lazy(() => PasskeyCreateWithoutUserInputSchema),z.lazy(() => PasskeyCreateWithoutUserInputSchema).array(),z.lazy(() => PasskeyUncheckedCreateWithoutUserInputSchema),z.lazy(() => PasskeyUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => PasskeyCreateOrConnectWithoutUserInputSchema),z.lazy(() => PasskeyCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => PasskeyUpsertWithWhereUniqueWithoutUserInputSchema),z.lazy(() => PasskeyUpsertWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => PasskeyCreateManyUserInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => PasskeyWhereUniqueInputSchema),z.lazy(() => PasskeyWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => PasskeyWhereUniqueInputSchema),z.lazy(() => PasskeyWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => PasskeyWhereUniqueInputSchema),z.lazy(() => PasskeyWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => PasskeyWhereUniqueInputSchema),z.lazy(() => PasskeyWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => PasskeyUpdateWithWhereUniqueWithoutUserInputSchema),z.lazy(() => PasskeyUpdateWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => PasskeyUpdateManyWithWhereWithoutUserInputSchema),z.lazy(() => PasskeyUpdateManyWithWhereWithoutUserInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => PasskeyScalarWhereInputSchema),z.lazy(() => PasskeyScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const InvitationUncheckedUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.InvitationUncheckedUpdateManyWithoutUserNestedInput> = z.object({
  create: z.union([ z.lazy(() => InvitationCreateWithoutUserInputSchema),z.lazy(() => InvitationCreateWithoutUserInputSchema).array(),z.lazy(() => InvitationUncheckedCreateWithoutUserInputSchema),z.lazy(() => InvitationUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => InvitationCreateOrConnectWithoutUserInputSchema),z.lazy(() => InvitationCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => InvitationUpsertWithWhereUniqueWithoutUserInputSchema),z.lazy(() => InvitationUpsertWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => InvitationCreateManyUserInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => InvitationWhereUniqueInputSchema),z.lazy(() => InvitationWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => InvitationWhereUniqueInputSchema),z.lazy(() => InvitationWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => InvitationWhereUniqueInputSchema),z.lazy(() => InvitationWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => InvitationWhereUniqueInputSchema),z.lazy(() => InvitationWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => InvitationUpdateWithWhereUniqueWithoutUserInputSchema),z.lazy(() => InvitationUpdateWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => InvitationUpdateManyWithWhereWithoutUserInputSchema),z.lazy(() => InvitationUpdateManyWithWhereWithoutUserInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => InvitationScalarWhereInputSchema),z.lazy(() => InvitationScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const PurchaseUncheckedUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.PurchaseUncheckedUpdateManyWithoutUserNestedInput> = z.object({
  create: z.union([ z.lazy(() => PurchaseCreateWithoutUserInputSchema),z.lazy(() => PurchaseCreateWithoutUserInputSchema).array(),z.lazy(() => PurchaseUncheckedCreateWithoutUserInputSchema),z.lazy(() => PurchaseUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => PurchaseCreateOrConnectWithoutUserInputSchema),z.lazy(() => PurchaseCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => PurchaseUpsertWithWhereUniqueWithoutUserInputSchema),z.lazy(() => PurchaseUpsertWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => PurchaseCreateManyUserInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => PurchaseWhereUniqueInputSchema),z.lazy(() => PurchaseWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => PurchaseWhereUniqueInputSchema),z.lazy(() => PurchaseWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => PurchaseWhereUniqueInputSchema),z.lazy(() => PurchaseWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => PurchaseWhereUniqueInputSchema),z.lazy(() => PurchaseWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => PurchaseUpdateWithWhereUniqueWithoutUserInputSchema),z.lazy(() => PurchaseUpdateWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => PurchaseUpdateManyWithWhereWithoutUserInputSchema),z.lazy(() => PurchaseUpdateManyWithWhereWithoutUserInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => PurchaseScalarWhereInputSchema),z.lazy(() => PurchaseScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const MemberUncheckedUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.MemberUncheckedUpdateManyWithoutUserNestedInput> = z.object({
  create: z.union([ z.lazy(() => MemberCreateWithoutUserInputSchema),z.lazy(() => MemberCreateWithoutUserInputSchema).array(),z.lazy(() => MemberUncheckedCreateWithoutUserInputSchema),z.lazy(() => MemberUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => MemberCreateOrConnectWithoutUserInputSchema),z.lazy(() => MemberCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => MemberUpsertWithWhereUniqueWithoutUserInputSchema),z.lazy(() => MemberUpsertWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => MemberCreateManyUserInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => MemberWhereUniqueInputSchema),z.lazy(() => MemberWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => MemberWhereUniqueInputSchema),z.lazy(() => MemberWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => MemberWhereUniqueInputSchema),z.lazy(() => MemberWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => MemberWhereUniqueInputSchema),z.lazy(() => MemberWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => MemberUpdateWithWhereUniqueWithoutUserInputSchema),z.lazy(() => MemberUpdateWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => MemberUpdateManyWithWhereWithoutUserInputSchema),z.lazy(() => MemberUpdateManyWithWhereWithoutUserInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => MemberScalarWhereInputSchema),z.lazy(() => MemberScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const AiChatUncheckedUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.AiChatUncheckedUpdateManyWithoutUserNestedInput> = z.object({
  create: z.union([ z.lazy(() => AiChatCreateWithoutUserInputSchema),z.lazy(() => AiChatCreateWithoutUserInputSchema).array(),z.lazy(() => AiChatUncheckedCreateWithoutUserInputSchema),z.lazy(() => AiChatUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => AiChatCreateOrConnectWithoutUserInputSchema),z.lazy(() => AiChatCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => AiChatUpsertWithWhereUniqueWithoutUserInputSchema),z.lazy(() => AiChatUpsertWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => AiChatCreateManyUserInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => AiChatWhereUniqueInputSchema),z.lazy(() => AiChatWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => AiChatWhereUniqueInputSchema),z.lazy(() => AiChatWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => AiChatWhereUniqueInputSchema),z.lazy(() => AiChatWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => AiChatWhereUniqueInputSchema),z.lazy(() => AiChatWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => AiChatUpdateWithWhereUniqueWithoutUserInputSchema),z.lazy(() => AiChatUpdateWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => AiChatUpdateManyWithWhereWithoutUserInputSchema),z.lazy(() => AiChatUpdateManyWithWhereWithoutUserInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => AiChatScalarWhereInputSchema),z.lazy(() => AiChatScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const UserSubscriptionUncheckedUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.UserSubscriptionUncheckedUpdateManyWithoutUserNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserSubscriptionCreateWithoutUserInputSchema),z.lazy(() => UserSubscriptionCreateWithoutUserInputSchema).array(),z.lazy(() => UserSubscriptionUncheckedCreateWithoutUserInputSchema),z.lazy(() => UserSubscriptionUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => UserSubscriptionCreateOrConnectWithoutUserInputSchema),z.lazy(() => UserSubscriptionCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => UserSubscriptionUpsertWithWhereUniqueWithoutUserInputSchema),z.lazy(() => UserSubscriptionUpsertWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => UserSubscriptionCreateManyUserInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => UserSubscriptionWhereUniqueInputSchema),z.lazy(() => UserSubscriptionWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => UserSubscriptionWhereUniqueInputSchema),z.lazy(() => UserSubscriptionWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => UserSubscriptionWhereUniqueInputSchema),z.lazy(() => UserSubscriptionWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => UserSubscriptionWhereUniqueInputSchema),z.lazy(() => UserSubscriptionWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => UserSubscriptionUpdateWithWhereUniqueWithoutUserInputSchema),z.lazy(() => UserSubscriptionUpdateWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => UserSubscriptionUpdateManyWithWhereWithoutUserInputSchema),z.lazy(() => UserSubscriptionUpdateManyWithWhereWithoutUserInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => UserSubscriptionScalarWhereInputSchema),z.lazy(() => UserSubscriptionScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const BlogPostUncheckedUpdateManyWithoutAuthorNestedInputSchema: z.ZodType<Prisma.BlogPostUncheckedUpdateManyWithoutAuthorNestedInput> = z.object({
  create: z.union([ z.lazy(() => BlogPostCreateWithoutAuthorInputSchema),z.lazy(() => BlogPostCreateWithoutAuthorInputSchema).array(),z.lazy(() => BlogPostUncheckedCreateWithoutAuthorInputSchema),z.lazy(() => BlogPostUncheckedCreateWithoutAuthorInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => BlogPostCreateOrConnectWithoutAuthorInputSchema),z.lazy(() => BlogPostCreateOrConnectWithoutAuthorInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => BlogPostUpsertWithWhereUniqueWithoutAuthorInputSchema),z.lazy(() => BlogPostUpsertWithWhereUniqueWithoutAuthorInputSchema).array() ]).optional(),
  createMany: z.lazy(() => BlogPostCreateManyAuthorInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => BlogPostWhereUniqueInputSchema),z.lazy(() => BlogPostWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => BlogPostWhereUniqueInputSchema),z.lazy(() => BlogPostWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => BlogPostWhereUniqueInputSchema),z.lazy(() => BlogPostWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => BlogPostWhereUniqueInputSchema),z.lazy(() => BlogPostWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => BlogPostUpdateWithWhereUniqueWithoutAuthorInputSchema),z.lazy(() => BlogPostUpdateWithWhereUniqueWithoutAuthorInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => BlogPostUpdateManyWithWhereWithoutAuthorInputSchema),z.lazy(() => BlogPostUpdateManyWithWhereWithoutAuthorInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => BlogPostScalarWhereInputSchema),z.lazy(() => BlogPostScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const UserCreateNestedOneWithoutSessionsInputSchema: z.ZodType<Prisma.UserCreateNestedOneWithoutSessionsInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutSessionsInputSchema),z.lazy(() => UserUncheckedCreateWithoutSessionsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutSessionsInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional()
}).strict();

export const UserUpdateOneRequiredWithoutSessionsNestedInputSchema: z.ZodType<Prisma.UserUpdateOneRequiredWithoutSessionsNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutSessionsInputSchema),z.lazy(() => UserUncheckedCreateWithoutSessionsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutSessionsInputSchema).optional(),
  upsert: z.lazy(() => UserUpsertWithoutSessionsInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => UserUpdateToOneWithWhereWithoutSessionsInputSchema),z.lazy(() => UserUpdateWithoutSessionsInputSchema),z.lazy(() => UserUncheckedUpdateWithoutSessionsInputSchema) ]).optional(),
}).strict();

export const UserCreateNestedOneWithoutAccountsInputSchema: z.ZodType<Prisma.UserCreateNestedOneWithoutAccountsInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutAccountsInputSchema),z.lazy(() => UserUncheckedCreateWithoutAccountsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutAccountsInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional()
}).strict();

export const UserUpdateOneRequiredWithoutAccountsNestedInputSchema: z.ZodType<Prisma.UserUpdateOneRequiredWithoutAccountsNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutAccountsInputSchema),z.lazy(() => UserUncheckedCreateWithoutAccountsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutAccountsInputSchema).optional(),
  upsert: z.lazy(() => UserUpsertWithoutAccountsInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => UserUpdateToOneWithWhereWithoutAccountsInputSchema),z.lazy(() => UserUpdateWithoutAccountsInputSchema),z.lazy(() => UserUncheckedUpdateWithoutAccountsInputSchema) ]).optional(),
}).strict();

export const UserCreateNestedOneWithoutPasskeysInputSchema: z.ZodType<Prisma.UserCreateNestedOneWithoutPasskeysInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutPasskeysInputSchema),z.lazy(() => UserUncheckedCreateWithoutPasskeysInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutPasskeysInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional()
}).strict();

export const IntFieldUpdateOperationsInputSchema: z.ZodType<Prisma.IntFieldUpdateOperationsInput> = z.object({
  set: z.number().optional(),
  increment: z.number().optional(),
  decrement: z.number().optional(),
  multiply: z.number().optional(),
  divide: z.number().optional()
}).strict();

export const UserUpdateOneRequiredWithoutPasskeysNestedInputSchema: z.ZodType<Prisma.UserUpdateOneRequiredWithoutPasskeysNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutPasskeysInputSchema),z.lazy(() => UserUncheckedCreateWithoutPasskeysInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutPasskeysInputSchema).optional(),
  upsert: z.lazy(() => UserUpsertWithoutPasskeysInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => UserUpdateToOneWithWhereWithoutPasskeysInputSchema),z.lazy(() => UserUpdateWithoutPasskeysInputSchema),z.lazy(() => UserUncheckedUpdateWithoutPasskeysInputSchema) ]).optional(),
}).strict();

export const MemberCreateNestedManyWithoutOrganizationInputSchema: z.ZodType<Prisma.MemberCreateNestedManyWithoutOrganizationInput> = z.object({
  create: z.union([ z.lazy(() => MemberCreateWithoutOrganizationInputSchema),z.lazy(() => MemberCreateWithoutOrganizationInputSchema).array(),z.lazy(() => MemberUncheckedCreateWithoutOrganizationInputSchema),z.lazy(() => MemberUncheckedCreateWithoutOrganizationInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => MemberCreateOrConnectWithoutOrganizationInputSchema),z.lazy(() => MemberCreateOrConnectWithoutOrganizationInputSchema).array() ]).optional(),
  createMany: z.lazy(() => MemberCreateManyOrganizationInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => MemberWhereUniqueInputSchema),z.lazy(() => MemberWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const InvitationCreateNestedManyWithoutOrganizationInputSchema: z.ZodType<Prisma.InvitationCreateNestedManyWithoutOrganizationInput> = z.object({
  create: z.union([ z.lazy(() => InvitationCreateWithoutOrganizationInputSchema),z.lazy(() => InvitationCreateWithoutOrganizationInputSchema).array(),z.lazy(() => InvitationUncheckedCreateWithoutOrganizationInputSchema),z.lazy(() => InvitationUncheckedCreateWithoutOrganizationInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => InvitationCreateOrConnectWithoutOrganizationInputSchema),z.lazy(() => InvitationCreateOrConnectWithoutOrganizationInputSchema).array() ]).optional(),
  createMany: z.lazy(() => InvitationCreateManyOrganizationInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => InvitationWhereUniqueInputSchema),z.lazy(() => InvitationWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const PurchaseCreateNestedManyWithoutOrganizationInputSchema: z.ZodType<Prisma.PurchaseCreateNestedManyWithoutOrganizationInput> = z.object({
  create: z.union([ z.lazy(() => PurchaseCreateWithoutOrganizationInputSchema),z.lazy(() => PurchaseCreateWithoutOrganizationInputSchema).array(),z.lazy(() => PurchaseUncheckedCreateWithoutOrganizationInputSchema),z.lazy(() => PurchaseUncheckedCreateWithoutOrganizationInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => PurchaseCreateOrConnectWithoutOrganizationInputSchema),z.lazy(() => PurchaseCreateOrConnectWithoutOrganizationInputSchema).array() ]).optional(),
  createMany: z.lazy(() => PurchaseCreateManyOrganizationInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => PurchaseWhereUniqueInputSchema),z.lazy(() => PurchaseWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const AiChatCreateNestedManyWithoutOrganizationInputSchema: z.ZodType<Prisma.AiChatCreateNestedManyWithoutOrganizationInput> = z.object({
  create: z.union([ z.lazy(() => AiChatCreateWithoutOrganizationInputSchema),z.lazy(() => AiChatCreateWithoutOrganizationInputSchema).array(),z.lazy(() => AiChatUncheckedCreateWithoutOrganizationInputSchema),z.lazy(() => AiChatUncheckedCreateWithoutOrganizationInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => AiChatCreateOrConnectWithoutOrganizationInputSchema),z.lazy(() => AiChatCreateOrConnectWithoutOrganizationInputSchema).array() ]).optional(),
  createMany: z.lazy(() => AiChatCreateManyOrganizationInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => AiChatWhereUniqueInputSchema),z.lazy(() => AiChatWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const MemberUncheckedCreateNestedManyWithoutOrganizationInputSchema: z.ZodType<Prisma.MemberUncheckedCreateNestedManyWithoutOrganizationInput> = z.object({
  create: z.union([ z.lazy(() => MemberCreateWithoutOrganizationInputSchema),z.lazy(() => MemberCreateWithoutOrganizationInputSchema).array(),z.lazy(() => MemberUncheckedCreateWithoutOrganizationInputSchema),z.lazy(() => MemberUncheckedCreateWithoutOrganizationInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => MemberCreateOrConnectWithoutOrganizationInputSchema),z.lazy(() => MemberCreateOrConnectWithoutOrganizationInputSchema).array() ]).optional(),
  createMany: z.lazy(() => MemberCreateManyOrganizationInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => MemberWhereUniqueInputSchema),z.lazy(() => MemberWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const InvitationUncheckedCreateNestedManyWithoutOrganizationInputSchema: z.ZodType<Prisma.InvitationUncheckedCreateNestedManyWithoutOrganizationInput> = z.object({
  create: z.union([ z.lazy(() => InvitationCreateWithoutOrganizationInputSchema),z.lazy(() => InvitationCreateWithoutOrganizationInputSchema).array(),z.lazy(() => InvitationUncheckedCreateWithoutOrganizationInputSchema),z.lazy(() => InvitationUncheckedCreateWithoutOrganizationInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => InvitationCreateOrConnectWithoutOrganizationInputSchema),z.lazy(() => InvitationCreateOrConnectWithoutOrganizationInputSchema).array() ]).optional(),
  createMany: z.lazy(() => InvitationCreateManyOrganizationInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => InvitationWhereUniqueInputSchema),z.lazy(() => InvitationWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const PurchaseUncheckedCreateNestedManyWithoutOrganizationInputSchema: z.ZodType<Prisma.PurchaseUncheckedCreateNestedManyWithoutOrganizationInput> = z.object({
  create: z.union([ z.lazy(() => PurchaseCreateWithoutOrganizationInputSchema),z.lazy(() => PurchaseCreateWithoutOrganizationInputSchema).array(),z.lazy(() => PurchaseUncheckedCreateWithoutOrganizationInputSchema),z.lazy(() => PurchaseUncheckedCreateWithoutOrganizationInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => PurchaseCreateOrConnectWithoutOrganizationInputSchema),z.lazy(() => PurchaseCreateOrConnectWithoutOrganizationInputSchema).array() ]).optional(),
  createMany: z.lazy(() => PurchaseCreateManyOrganizationInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => PurchaseWhereUniqueInputSchema),z.lazy(() => PurchaseWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const AiChatUncheckedCreateNestedManyWithoutOrganizationInputSchema: z.ZodType<Prisma.AiChatUncheckedCreateNestedManyWithoutOrganizationInput> = z.object({
  create: z.union([ z.lazy(() => AiChatCreateWithoutOrganizationInputSchema),z.lazy(() => AiChatCreateWithoutOrganizationInputSchema).array(),z.lazy(() => AiChatUncheckedCreateWithoutOrganizationInputSchema),z.lazy(() => AiChatUncheckedCreateWithoutOrganizationInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => AiChatCreateOrConnectWithoutOrganizationInputSchema),z.lazy(() => AiChatCreateOrConnectWithoutOrganizationInputSchema).array() ]).optional(),
  createMany: z.lazy(() => AiChatCreateManyOrganizationInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => AiChatWhereUniqueInputSchema),z.lazy(() => AiChatWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const MemberUpdateManyWithoutOrganizationNestedInputSchema: z.ZodType<Prisma.MemberUpdateManyWithoutOrganizationNestedInput> = z.object({
  create: z.union([ z.lazy(() => MemberCreateWithoutOrganizationInputSchema),z.lazy(() => MemberCreateWithoutOrganizationInputSchema).array(),z.lazy(() => MemberUncheckedCreateWithoutOrganizationInputSchema),z.lazy(() => MemberUncheckedCreateWithoutOrganizationInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => MemberCreateOrConnectWithoutOrganizationInputSchema),z.lazy(() => MemberCreateOrConnectWithoutOrganizationInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => MemberUpsertWithWhereUniqueWithoutOrganizationInputSchema),z.lazy(() => MemberUpsertWithWhereUniqueWithoutOrganizationInputSchema).array() ]).optional(),
  createMany: z.lazy(() => MemberCreateManyOrganizationInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => MemberWhereUniqueInputSchema),z.lazy(() => MemberWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => MemberWhereUniqueInputSchema),z.lazy(() => MemberWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => MemberWhereUniqueInputSchema),z.lazy(() => MemberWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => MemberWhereUniqueInputSchema),z.lazy(() => MemberWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => MemberUpdateWithWhereUniqueWithoutOrganizationInputSchema),z.lazy(() => MemberUpdateWithWhereUniqueWithoutOrganizationInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => MemberUpdateManyWithWhereWithoutOrganizationInputSchema),z.lazy(() => MemberUpdateManyWithWhereWithoutOrganizationInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => MemberScalarWhereInputSchema),z.lazy(() => MemberScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const InvitationUpdateManyWithoutOrganizationNestedInputSchema: z.ZodType<Prisma.InvitationUpdateManyWithoutOrganizationNestedInput> = z.object({
  create: z.union([ z.lazy(() => InvitationCreateWithoutOrganizationInputSchema),z.lazy(() => InvitationCreateWithoutOrganizationInputSchema).array(),z.lazy(() => InvitationUncheckedCreateWithoutOrganizationInputSchema),z.lazy(() => InvitationUncheckedCreateWithoutOrganizationInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => InvitationCreateOrConnectWithoutOrganizationInputSchema),z.lazy(() => InvitationCreateOrConnectWithoutOrganizationInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => InvitationUpsertWithWhereUniqueWithoutOrganizationInputSchema),z.lazy(() => InvitationUpsertWithWhereUniqueWithoutOrganizationInputSchema).array() ]).optional(),
  createMany: z.lazy(() => InvitationCreateManyOrganizationInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => InvitationWhereUniqueInputSchema),z.lazy(() => InvitationWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => InvitationWhereUniqueInputSchema),z.lazy(() => InvitationWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => InvitationWhereUniqueInputSchema),z.lazy(() => InvitationWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => InvitationWhereUniqueInputSchema),z.lazy(() => InvitationWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => InvitationUpdateWithWhereUniqueWithoutOrganizationInputSchema),z.lazy(() => InvitationUpdateWithWhereUniqueWithoutOrganizationInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => InvitationUpdateManyWithWhereWithoutOrganizationInputSchema),z.lazy(() => InvitationUpdateManyWithWhereWithoutOrganizationInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => InvitationScalarWhereInputSchema),z.lazy(() => InvitationScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const PurchaseUpdateManyWithoutOrganizationNestedInputSchema: z.ZodType<Prisma.PurchaseUpdateManyWithoutOrganizationNestedInput> = z.object({
  create: z.union([ z.lazy(() => PurchaseCreateWithoutOrganizationInputSchema),z.lazy(() => PurchaseCreateWithoutOrganizationInputSchema).array(),z.lazy(() => PurchaseUncheckedCreateWithoutOrganizationInputSchema),z.lazy(() => PurchaseUncheckedCreateWithoutOrganizationInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => PurchaseCreateOrConnectWithoutOrganizationInputSchema),z.lazy(() => PurchaseCreateOrConnectWithoutOrganizationInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => PurchaseUpsertWithWhereUniqueWithoutOrganizationInputSchema),z.lazy(() => PurchaseUpsertWithWhereUniqueWithoutOrganizationInputSchema).array() ]).optional(),
  createMany: z.lazy(() => PurchaseCreateManyOrganizationInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => PurchaseWhereUniqueInputSchema),z.lazy(() => PurchaseWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => PurchaseWhereUniqueInputSchema),z.lazy(() => PurchaseWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => PurchaseWhereUniqueInputSchema),z.lazy(() => PurchaseWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => PurchaseWhereUniqueInputSchema),z.lazy(() => PurchaseWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => PurchaseUpdateWithWhereUniqueWithoutOrganizationInputSchema),z.lazy(() => PurchaseUpdateWithWhereUniqueWithoutOrganizationInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => PurchaseUpdateManyWithWhereWithoutOrganizationInputSchema),z.lazy(() => PurchaseUpdateManyWithWhereWithoutOrganizationInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => PurchaseScalarWhereInputSchema),z.lazy(() => PurchaseScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const AiChatUpdateManyWithoutOrganizationNestedInputSchema: z.ZodType<Prisma.AiChatUpdateManyWithoutOrganizationNestedInput> = z.object({
  create: z.union([ z.lazy(() => AiChatCreateWithoutOrganizationInputSchema),z.lazy(() => AiChatCreateWithoutOrganizationInputSchema).array(),z.lazy(() => AiChatUncheckedCreateWithoutOrganizationInputSchema),z.lazy(() => AiChatUncheckedCreateWithoutOrganizationInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => AiChatCreateOrConnectWithoutOrganizationInputSchema),z.lazy(() => AiChatCreateOrConnectWithoutOrganizationInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => AiChatUpsertWithWhereUniqueWithoutOrganizationInputSchema),z.lazy(() => AiChatUpsertWithWhereUniqueWithoutOrganizationInputSchema).array() ]).optional(),
  createMany: z.lazy(() => AiChatCreateManyOrganizationInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => AiChatWhereUniqueInputSchema),z.lazy(() => AiChatWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => AiChatWhereUniqueInputSchema),z.lazy(() => AiChatWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => AiChatWhereUniqueInputSchema),z.lazy(() => AiChatWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => AiChatWhereUniqueInputSchema),z.lazy(() => AiChatWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => AiChatUpdateWithWhereUniqueWithoutOrganizationInputSchema),z.lazy(() => AiChatUpdateWithWhereUniqueWithoutOrganizationInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => AiChatUpdateManyWithWhereWithoutOrganizationInputSchema),z.lazy(() => AiChatUpdateManyWithWhereWithoutOrganizationInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => AiChatScalarWhereInputSchema),z.lazy(() => AiChatScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const MemberUncheckedUpdateManyWithoutOrganizationNestedInputSchema: z.ZodType<Prisma.MemberUncheckedUpdateManyWithoutOrganizationNestedInput> = z.object({
  create: z.union([ z.lazy(() => MemberCreateWithoutOrganizationInputSchema),z.lazy(() => MemberCreateWithoutOrganizationInputSchema).array(),z.lazy(() => MemberUncheckedCreateWithoutOrganizationInputSchema),z.lazy(() => MemberUncheckedCreateWithoutOrganizationInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => MemberCreateOrConnectWithoutOrganizationInputSchema),z.lazy(() => MemberCreateOrConnectWithoutOrganizationInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => MemberUpsertWithWhereUniqueWithoutOrganizationInputSchema),z.lazy(() => MemberUpsertWithWhereUniqueWithoutOrganizationInputSchema).array() ]).optional(),
  createMany: z.lazy(() => MemberCreateManyOrganizationInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => MemberWhereUniqueInputSchema),z.lazy(() => MemberWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => MemberWhereUniqueInputSchema),z.lazy(() => MemberWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => MemberWhereUniqueInputSchema),z.lazy(() => MemberWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => MemberWhereUniqueInputSchema),z.lazy(() => MemberWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => MemberUpdateWithWhereUniqueWithoutOrganizationInputSchema),z.lazy(() => MemberUpdateWithWhereUniqueWithoutOrganizationInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => MemberUpdateManyWithWhereWithoutOrganizationInputSchema),z.lazy(() => MemberUpdateManyWithWhereWithoutOrganizationInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => MemberScalarWhereInputSchema),z.lazy(() => MemberScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const InvitationUncheckedUpdateManyWithoutOrganizationNestedInputSchema: z.ZodType<Prisma.InvitationUncheckedUpdateManyWithoutOrganizationNestedInput> = z.object({
  create: z.union([ z.lazy(() => InvitationCreateWithoutOrganizationInputSchema),z.lazy(() => InvitationCreateWithoutOrganizationInputSchema).array(),z.lazy(() => InvitationUncheckedCreateWithoutOrganizationInputSchema),z.lazy(() => InvitationUncheckedCreateWithoutOrganizationInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => InvitationCreateOrConnectWithoutOrganizationInputSchema),z.lazy(() => InvitationCreateOrConnectWithoutOrganizationInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => InvitationUpsertWithWhereUniqueWithoutOrganizationInputSchema),z.lazy(() => InvitationUpsertWithWhereUniqueWithoutOrganizationInputSchema).array() ]).optional(),
  createMany: z.lazy(() => InvitationCreateManyOrganizationInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => InvitationWhereUniqueInputSchema),z.lazy(() => InvitationWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => InvitationWhereUniqueInputSchema),z.lazy(() => InvitationWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => InvitationWhereUniqueInputSchema),z.lazy(() => InvitationWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => InvitationWhereUniqueInputSchema),z.lazy(() => InvitationWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => InvitationUpdateWithWhereUniqueWithoutOrganizationInputSchema),z.lazy(() => InvitationUpdateWithWhereUniqueWithoutOrganizationInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => InvitationUpdateManyWithWhereWithoutOrganizationInputSchema),z.lazy(() => InvitationUpdateManyWithWhereWithoutOrganizationInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => InvitationScalarWhereInputSchema),z.lazy(() => InvitationScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const PurchaseUncheckedUpdateManyWithoutOrganizationNestedInputSchema: z.ZodType<Prisma.PurchaseUncheckedUpdateManyWithoutOrganizationNestedInput> = z.object({
  create: z.union([ z.lazy(() => PurchaseCreateWithoutOrganizationInputSchema),z.lazy(() => PurchaseCreateWithoutOrganizationInputSchema).array(),z.lazy(() => PurchaseUncheckedCreateWithoutOrganizationInputSchema),z.lazy(() => PurchaseUncheckedCreateWithoutOrganizationInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => PurchaseCreateOrConnectWithoutOrganizationInputSchema),z.lazy(() => PurchaseCreateOrConnectWithoutOrganizationInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => PurchaseUpsertWithWhereUniqueWithoutOrganizationInputSchema),z.lazy(() => PurchaseUpsertWithWhereUniqueWithoutOrganizationInputSchema).array() ]).optional(),
  createMany: z.lazy(() => PurchaseCreateManyOrganizationInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => PurchaseWhereUniqueInputSchema),z.lazy(() => PurchaseWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => PurchaseWhereUniqueInputSchema),z.lazy(() => PurchaseWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => PurchaseWhereUniqueInputSchema),z.lazy(() => PurchaseWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => PurchaseWhereUniqueInputSchema),z.lazy(() => PurchaseWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => PurchaseUpdateWithWhereUniqueWithoutOrganizationInputSchema),z.lazy(() => PurchaseUpdateWithWhereUniqueWithoutOrganizationInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => PurchaseUpdateManyWithWhereWithoutOrganizationInputSchema),z.lazy(() => PurchaseUpdateManyWithWhereWithoutOrganizationInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => PurchaseScalarWhereInputSchema),z.lazy(() => PurchaseScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const AiChatUncheckedUpdateManyWithoutOrganizationNestedInputSchema: z.ZodType<Prisma.AiChatUncheckedUpdateManyWithoutOrganizationNestedInput> = z.object({
  create: z.union([ z.lazy(() => AiChatCreateWithoutOrganizationInputSchema),z.lazy(() => AiChatCreateWithoutOrganizationInputSchema).array(),z.lazy(() => AiChatUncheckedCreateWithoutOrganizationInputSchema),z.lazy(() => AiChatUncheckedCreateWithoutOrganizationInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => AiChatCreateOrConnectWithoutOrganizationInputSchema),z.lazy(() => AiChatCreateOrConnectWithoutOrganizationInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => AiChatUpsertWithWhereUniqueWithoutOrganizationInputSchema),z.lazy(() => AiChatUpsertWithWhereUniqueWithoutOrganizationInputSchema).array() ]).optional(),
  createMany: z.lazy(() => AiChatCreateManyOrganizationInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => AiChatWhereUniqueInputSchema),z.lazy(() => AiChatWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => AiChatWhereUniqueInputSchema),z.lazy(() => AiChatWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => AiChatWhereUniqueInputSchema),z.lazy(() => AiChatWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => AiChatWhereUniqueInputSchema),z.lazy(() => AiChatWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => AiChatUpdateWithWhereUniqueWithoutOrganizationInputSchema),z.lazy(() => AiChatUpdateWithWhereUniqueWithoutOrganizationInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => AiChatUpdateManyWithWhereWithoutOrganizationInputSchema),z.lazy(() => AiChatUpdateManyWithWhereWithoutOrganizationInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => AiChatScalarWhereInputSchema),z.lazy(() => AiChatScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const OrganizationCreateNestedOneWithoutMembersInputSchema: z.ZodType<Prisma.OrganizationCreateNestedOneWithoutMembersInput> = z.object({
  create: z.union([ z.lazy(() => OrganizationCreateWithoutMembersInputSchema),z.lazy(() => OrganizationUncheckedCreateWithoutMembersInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => OrganizationCreateOrConnectWithoutMembersInputSchema).optional(),
  connect: z.lazy(() => OrganizationWhereUniqueInputSchema).optional()
}).strict();

export const UserCreateNestedOneWithoutMembershipsInputSchema: z.ZodType<Prisma.UserCreateNestedOneWithoutMembershipsInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutMembershipsInputSchema),z.lazy(() => UserUncheckedCreateWithoutMembershipsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutMembershipsInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional()
}).strict();

export const OrganizationUpdateOneRequiredWithoutMembersNestedInputSchema: z.ZodType<Prisma.OrganizationUpdateOneRequiredWithoutMembersNestedInput> = z.object({
  create: z.union([ z.lazy(() => OrganizationCreateWithoutMembersInputSchema),z.lazy(() => OrganizationUncheckedCreateWithoutMembersInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => OrganizationCreateOrConnectWithoutMembersInputSchema).optional(),
  upsert: z.lazy(() => OrganizationUpsertWithoutMembersInputSchema).optional(),
  connect: z.lazy(() => OrganizationWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => OrganizationUpdateToOneWithWhereWithoutMembersInputSchema),z.lazy(() => OrganizationUpdateWithoutMembersInputSchema),z.lazy(() => OrganizationUncheckedUpdateWithoutMembersInputSchema) ]).optional(),
}).strict();

export const UserUpdateOneRequiredWithoutMembershipsNestedInputSchema: z.ZodType<Prisma.UserUpdateOneRequiredWithoutMembershipsNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutMembershipsInputSchema),z.lazy(() => UserUncheckedCreateWithoutMembershipsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutMembershipsInputSchema).optional(),
  upsert: z.lazy(() => UserUpsertWithoutMembershipsInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => UserUpdateToOneWithWhereWithoutMembershipsInputSchema),z.lazy(() => UserUpdateWithoutMembershipsInputSchema),z.lazy(() => UserUncheckedUpdateWithoutMembershipsInputSchema) ]).optional(),
}).strict();

export const OrganizationCreateNestedOneWithoutInvitationsInputSchema: z.ZodType<Prisma.OrganizationCreateNestedOneWithoutInvitationsInput> = z.object({
  create: z.union([ z.lazy(() => OrganizationCreateWithoutInvitationsInputSchema),z.lazy(() => OrganizationUncheckedCreateWithoutInvitationsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => OrganizationCreateOrConnectWithoutInvitationsInputSchema).optional(),
  connect: z.lazy(() => OrganizationWhereUniqueInputSchema).optional()
}).strict();

export const UserCreateNestedOneWithoutInvitationsInputSchema: z.ZodType<Prisma.UserCreateNestedOneWithoutInvitationsInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutInvitationsInputSchema),z.lazy(() => UserUncheckedCreateWithoutInvitationsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutInvitationsInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional()
}).strict();

export const OrganizationUpdateOneRequiredWithoutInvitationsNestedInputSchema: z.ZodType<Prisma.OrganizationUpdateOneRequiredWithoutInvitationsNestedInput> = z.object({
  create: z.union([ z.lazy(() => OrganizationCreateWithoutInvitationsInputSchema),z.lazy(() => OrganizationUncheckedCreateWithoutInvitationsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => OrganizationCreateOrConnectWithoutInvitationsInputSchema).optional(),
  upsert: z.lazy(() => OrganizationUpsertWithoutInvitationsInputSchema).optional(),
  connect: z.lazy(() => OrganizationWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => OrganizationUpdateToOneWithWhereWithoutInvitationsInputSchema),z.lazy(() => OrganizationUpdateWithoutInvitationsInputSchema),z.lazy(() => OrganizationUncheckedUpdateWithoutInvitationsInputSchema) ]).optional(),
}).strict();

export const UserUpdateOneRequiredWithoutInvitationsNestedInputSchema: z.ZodType<Prisma.UserUpdateOneRequiredWithoutInvitationsNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutInvitationsInputSchema),z.lazy(() => UserUncheckedCreateWithoutInvitationsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutInvitationsInputSchema).optional(),
  upsert: z.lazy(() => UserUpsertWithoutInvitationsInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => UserUpdateToOneWithWhereWithoutInvitationsInputSchema),z.lazy(() => UserUpdateWithoutInvitationsInputSchema),z.lazy(() => UserUncheckedUpdateWithoutInvitationsInputSchema) ]).optional(),
}).strict();

export const OrganizationCreateNestedOneWithoutPurchasesInputSchema: z.ZodType<Prisma.OrganizationCreateNestedOneWithoutPurchasesInput> = z.object({
  create: z.union([ z.lazy(() => OrganizationCreateWithoutPurchasesInputSchema),z.lazy(() => OrganizationUncheckedCreateWithoutPurchasesInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => OrganizationCreateOrConnectWithoutPurchasesInputSchema).optional(),
  connect: z.lazy(() => OrganizationWhereUniqueInputSchema).optional()
}).strict();

export const UserCreateNestedOneWithoutPurchasesInputSchema: z.ZodType<Prisma.UserCreateNestedOneWithoutPurchasesInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutPurchasesInputSchema),z.lazy(() => UserUncheckedCreateWithoutPurchasesInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutPurchasesInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional()
}).strict();

export const EnumPurchaseTypeFieldUpdateOperationsInputSchema: z.ZodType<Prisma.EnumPurchaseTypeFieldUpdateOperationsInput> = z.object({
  set: z.lazy(() => PurchaseTypeSchema).optional()
}).strict();

export const OrganizationUpdateOneWithoutPurchasesNestedInputSchema: z.ZodType<Prisma.OrganizationUpdateOneWithoutPurchasesNestedInput> = z.object({
  create: z.union([ z.lazy(() => OrganizationCreateWithoutPurchasesInputSchema),z.lazy(() => OrganizationUncheckedCreateWithoutPurchasesInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => OrganizationCreateOrConnectWithoutPurchasesInputSchema).optional(),
  upsert: z.lazy(() => OrganizationUpsertWithoutPurchasesInputSchema).optional(),
  disconnect: z.union([ z.boolean(),z.lazy(() => OrganizationWhereInputSchema) ]).optional(),
  delete: z.union([ z.boolean(),z.lazy(() => OrganizationWhereInputSchema) ]).optional(),
  connect: z.lazy(() => OrganizationWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => OrganizationUpdateToOneWithWhereWithoutPurchasesInputSchema),z.lazy(() => OrganizationUpdateWithoutPurchasesInputSchema),z.lazy(() => OrganizationUncheckedUpdateWithoutPurchasesInputSchema) ]).optional(),
}).strict();

export const UserUpdateOneWithoutPurchasesNestedInputSchema: z.ZodType<Prisma.UserUpdateOneWithoutPurchasesNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutPurchasesInputSchema),z.lazy(() => UserUncheckedCreateWithoutPurchasesInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutPurchasesInputSchema).optional(),
  upsert: z.lazy(() => UserUpsertWithoutPurchasesInputSchema).optional(),
  disconnect: z.union([ z.boolean(),z.lazy(() => UserWhereInputSchema) ]).optional(),
  delete: z.union([ z.boolean(),z.lazy(() => UserWhereInputSchema) ]).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => UserUpdateToOneWithWhereWithoutPurchasesInputSchema),z.lazy(() => UserUpdateWithoutPurchasesInputSchema),z.lazy(() => UserUncheckedUpdateWithoutPurchasesInputSchema) ]).optional(),
}).strict();

export const OrganizationCreateNestedOneWithoutAiChatsInputSchema: z.ZodType<Prisma.OrganizationCreateNestedOneWithoutAiChatsInput> = z.object({
  create: z.union([ z.lazy(() => OrganizationCreateWithoutAiChatsInputSchema),z.lazy(() => OrganizationUncheckedCreateWithoutAiChatsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => OrganizationCreateOrConnectWithoutAiChatsInputSchema).optional(),
  connect: z.lazy(() => OrganizationWhereUniqueInputSchema).optional()
}).strict();

export const UserCreateNestedOneWithoutAiChatsInputSchema: z.ZodType<Prisma.UserCreateNestedOneWithoutAiChatsInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutAiChatsInputSchema),z.lazy(() => UserUncheckedCreateWithoutAiChatsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutAiChatsInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional()
}).strict();

export const OrganizationUpdateOneWithoutAiChatsNestedInputSchema: z.ZodType<Prisma.OrganizationUpdateOneWithoutAiChatsNestedInput> = z.object({
  create: z.union([ z.lazy(() => OrganizationCreateWithoutAiChatsInputSchema),z.lazy(() => OrganizationUncheckedCreateWithoutAiChatsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => OrganizationCreateOrConnectWithoutAiChatsInputSchema).optional(),
  upsert: z.lazy(() => OrganizationUpsertWithoutAiChatsInputSchema).optional(),
  disconnect: z.union([ z.boolean(),z.lazy(() => OrganizationWhereInputSchema) ]).optional(),
  delete: z.union([ z.boolean(),z.lazy(() => OrganizationWhereInputSchema) ]).optional(),
  connect: z.lazy(() => OrganizationWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => OrganizationUpdateToOneWithWhereWithoutAiChatsInputSchema),z.lazy(() => OrganizationUpdateWithoutAiChatsInputSchema),z.lazy(() => OrganizationUncheckedUpdateWithoutAiChatsInputSchema) ]).optional(),
}).strict();

export const UserUpdateOneWithoutAiChatsNestedInputSchema: z.ZodType<Prisma.UserUpdateOneWithoutAiChatsNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutAiChatsInputSchema),z.lazy(() => UserUncheckedCreateWithoutAiChatsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutAiChatsInputSchema).optional(),
  upsert: z.lazy(() => UserUpsertWithoutAiChatsInputSchema).optional(),
  disconnect: z.union([ z.boolean(),z.lazy(() => UserWhereInputSchema) ]).optional(),
  delete: z.union([ z.boolean(),z.lazy(() => UserWhereInputSchema) ]).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => UserUpdateToOneWithWhereWithoutAiChatsInputSchema),z.lazy(() => UserUpdateWithoutAiChatsInputSchema),z.lazy(() => UserUncheckedUpdateWithoutAiChatsInputSchema) ]).optional(),
}).strict();

export const BlogPostCreatetagsInputSchema: z.ZodType<Prisma.BlogPostCreatetagsInput> = z.object({
  set: z.string().array()
}).strict();

export const UserCreateNestedOneWithoutBlogPostsInputSchema: z.ZodType<Prisma.UserCreateNestedOneWithoutBlogPostsInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutBlogPostsInputSchema),z.lazy(() => UserUncheckedCreateWithoutBlogPostsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutBlogPostsInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional()
}).strict();

export const BlogCategoryCreateNestedManyWithoutPostsInputSchema: z.ZodType<Prisma.BlogCategoryCreateNestedManyWithoutPostsInput> = z.object({
  create: z.union([ z.lazy(() => BlogCategoryCreateWithoutPostsInputSchema),z.lazy(() => BlogCategoryCreateWithoutPostsInputSchema).array(),z.lazy(() => BlogCategoryUncheckedCreateWithoutPostsInputSchema),z.lazy(() => BlogCategoryUncheckedCreateWithoutPostsInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => BlogCategoryCreateOrConnectWithoutPostsInputSchema),z.lazy(() => BlogCategoryCreateOrConnectWithoutPostsInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => BlogCategoryWhereUniqueInputSchema),z.lazy(() => BlogCategoryWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const BlogCategoryUncheckedCreateNestedManyWithoutPostsInputSchema: z.ZodType<Prisma.BlogCategoryUncheckedCreateNestedManyWithoutPostsInput> = z.object({
  create: z.union([ z.lazy(() => BlogCategoryCreateWithoutPostsInputSchema),z.lazy(() => BlogCategoryCreateWithoutPostsInputSchema).array(),z.lazy(() => BlogCategoryUncheckedCreateWithoutPostsInputSchema),z.lazy(() => BlogCategoryUncheckedCreateWithoutPostsInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => BlogCategoryCreateOrConnectWithoutPostsInputSchema),z.lazy(() => BlogCategoryCreateOrConnectWithoutPostsInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => BlogCategoryWhereUniqueInputSchema),z.lazy(() => BlogCategoryWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const EnumAccessLevelFieldUpdateOperationsInputSchema: z.ZodType<Prisma.EnumAccessLevelFieldUpdateOperationsInput> = z.object({
  set: z.lazy(() => AccessLevelSchema).optional()
}).strict();

export const BlogPostUpdatetagsInputSchema: z.ZodType<Prisma.BlogPostUpdatetagsInput> = z.object({
  set: z.string().array().optional(),
  push: z.union([ z.string(),z.string().array() ]).optional(),
}).strict();

export const UserUpdateOneRequiredWithoutBlogPostsNestedInputSchema: z.ZodType<Prisma.UserUpdateOneRequiredWithoutBlogPostsNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutBlogPostsInputSchema),z.lazy(() => UserUncheckedCreateWithoutBlogPostsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutBlogPostsInputSchema).optional(),
  upsert: z.lazy(() => UserUpsertWithoutBlogPostsInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => UserUpdateToOneWithWhereWithoutBlogPostsInputSchema),z.lazy(() => UserUpdateWithoutBlogPostsInputSchema),z.lazy(() => UserUncheckedUpdateWithoutBlogPostsInputSchema) ]).optional(),
}).strict();

export const BlogCategoryUpdateManyWithoutPostsNestedInputSchema: z.ZodType<Prisma.BlogCategoryUpdateManyWithoutPostsNestedInput> = z.object({
  create: z.union([ z.lazy(() => BlogCategoryCreateWithoutPostsInputSchema),z.lazy(() => BlogCategoryCreateWithoutPostsInputSchema).array(),z.lazy(() => BlogCategoryUncheckedCreateWithoutPostsInputSchema),z.lazy(() => BlogCategoryUncheckedCreateWithoutPostsInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => BlogCategoryCreateOrConnectWithoutPostsInputSchema),z.lazy(() => BlogCategoryCreateOrConnectWithoutPostsInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => BlogCategoryUpsertWithWhereUniqueWithoutPostsInputSchema),z.lazy(() => BlogCategoryUpsertWithWhereUniqueWithoutPostsInputSchema).array() ]).optional(),
  set: z.union([ z.lazy(() => BlogCategoryWhereUniqueInputSchema),z.lazy(() => BlogCategoryWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => BlogCategoryWhereUniqueInputSchema),z.lazy(() => BlogCategoryWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => BlogCategoryWhereUniqueInputSchema),z.lazy(() => BlogCategoryWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => BlogCategoryWhereUniqueInputSchema),z.lazy(() => BlogCategoryWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => BlogCategoryUpdateWithWhereUniqueWithoutPostsInputSchema),z.lazy(() => BlogCategoryUpdateWithWhereUniqueWithoutPostsInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => BlogCategoryUpdateManyWithWhereWithoutPostsInputSchema),z.lazy(() => BlogCategoryUpdateManyWithWhereWithoutPostsInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => BlogCategoryScalarWhereInputSchema),z.lazy(() => BlogCategoryScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const BlogCategoryUncheckedUpdateManyWithoutPostsNestedInputSchema: z.ZodType<Prisma.BlogCategoryUncheckedUpdateManyWithoutPostsNestedInput> = z.object({
  create: z.union([ z.lazy(() => BlogCategoryCreateWithoutPostsInputSchema),z.lazy(() => BlogCategoryCreateWithoutPostsInputSchema).array(),z.lazy(() => BlogCategoryUncheckedCreateWithoutPostsInputSchema),z.lazy(() => BlogCategoryUncheckedCreateWithoutPostsInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => BlogCategoryCreateOrConnectWithoutPostsInputSchema),z.lazy(() => BlogCategoryCreateOrConnectWithoutPostsInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => BlogCategoryUpsertWithWhereUniqueWithoutPostsInputSchema),z.lazy(() => BlogCategoryUpsertWithWhereUniqueWithoutPostsInputSchema).array() ]).optional(),
  set: z.union([ z.lazy(() => BlogCategoryWhereUniqueInputSchema),z.lazy(() => BlogCategoryWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => BlogCategoryWhereUniqueInputSchema),z.lazy(() => BlogCategoryWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => BlogCategoryWhereUniqueInputSchema),z.lazy(() => BlogCategoryWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => BlogCategoryWhereUniqueInputSchema),z.lazy(() => BlogCategoryWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => BlogCategoryUpdateWithWhereUniqueWithoutPostsInputSchema),z.lazy(() => BlogCategoryUpdateWithWhereUniqueWithoutPostsInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => BlogCategoryUpdateManyWithWhereWithoutPostsInputSchema),z.lazy(() => BlogCategoryUpdateManyWithWhereWithoutPostsInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => BlogCategoryScalarWhereInputSchema),z.lazy(() => BlogCategoryScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const UserSubscriptionCreateNestedManyWithoutPlanInputSchema: z.ZodType<Prisma.UserSubscriptionCreateNestedManyWithoutPlanInput> = z.object({
  create: z.union([ z.lazy(() => UserSubscriptionCreateWithoutPlanInputSchema),z.lazy(() => UserSubscriptionCreateWithoutPlanInputSchema).array(),z.lazy(() => UserSubscriptionUncheckedCreateWithoutPlanInputSchema),z.lazy(() => UserSubscriptionUncheckedCreateWithoutPlanInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => UserSubscriptionCreateOrConnectWithoutPlanInputSchema),z.lazy(() => UserSubscriptionCreateOrConnectWithoutPlanInputSchema).array() ]).optional(),
  createMany: z.lazy(() => UserSubscriptionCreateManyPlanInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => UserSubscriptionWhereUniqueInputSchema),z.lazy(() => UserSubscriptionWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const UserSubscriptionUncheckedCreateNestedManyWithoutPlanInputSchema: z.ZodType<Prisma.UserSubscriptionUncheckedCreateNestedManyWithoutPlanInput> = z.object({
  create: z.union([ z.lazy(() => UserSubscriptionCreateWithoutPlanInputSchema),z.lazy(() => UserSubscriptionCreateWithoutPlanInputSchema).array(),z.lazy(() => UserSubscriptionUncheckedCreateWithoutPlanInputSchema),z.lazy(() => UserSubscriptionUncheckedCreateWithoutPlanInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => UserSubscriptionCreateOrConnectWithoutPlanInputSchema),z.lazy(() => UserSubscriptionCreateOrConnectWithoutPlanInputSchema).array() ]).optional(),
  createMany: z.lazy(() => UserSubscriptionCreateManyPlanInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => UserSubscriptionWhereUniqueInputSchema),z.lazy(() => UserSubscriptionWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const DecimalFieldUpdateOperationsInputSchema: z.ZodType<Prisma.DecimalFieldUpdateOperationsInput> = z.object({
  set: z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  increment: z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  decrement: z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  multiply: z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  divide: z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional()
}).strict();

export const EnumPlanIntervalFieldUpdateOperationsInputSchema: z.ZodType<Prisma.EnumPlanIntervalFieldUpdateOperationsInput> = z.object({
  set: z.lazy(() => PlanIntervalSchema).optional()
}).strict();

export const UserSubscriptionUpdateManyWithoutPlanNestedInputSchema: z.ZodType<Prisma.UserSubscriptionUpdateManyWithoutPlanNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserSubscriptionCreateWithoutPlanInputSchema),z.lazy(() => UserSubscriptionCreateWithoutPlanInputSchema).array(),z.lazy(() => UserSubscriptionUncheckedCreateWithoutPlanInputSchema),z.lazy(() => UserSubscriptionUncheckedCreateWithoutPlanInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => UserSubscriptionCreateOrConnectWithoutPlanInputSchema),z.lazy(() => UserSubscriptionCreateOrConnectWithoutPlanInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => UserSubscriptionUpsertWithWhereUniqueWithoutPlanInputSchema),z.lazy(() => UserSubscriptionUpsertWithWhereUniqueWithoutPlanInputSchema).array() ]).optional(),
  createMany: z.lazy(() => UserSubscriptionCreateManyPlanInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => UserSubscriptionWhereUniqueInputSchema),z.lazy(() => UserSubscriptionWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => UserSubscriptionWhereUniqueInputSchema),z.lazy(() => UserSubscriptionWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => UserSubscriptionWhereUniqueInputSchema),z.lazy(() => UserSubscriptionWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => UserSubscriptionWhereUniqueInputSchema),z.lazy(() => UserSubscriptionWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => UserSubscriptionUpdateWithWhereUniqueWithoutPlanInputSchema),z.lazy(() => UserSubscriptionUpdateWithWhereUniqueWithoutPlanInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => UserSubscriptionUpdateManyWithWhereWithoutPlanInputSchema),z.lazy(() => UserSubscriptionUpdateManyWithWhereWithoutPlanInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => UserSubscriptionScalarWhereInputSchema),z.lazy(() => UserSubscriptionScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const UserSubscriptionUncheckedUpdateManyWithoutPlanNestedInputSchema: z.ZodType<Prisma.UserSubscriptionUncheckedUpdateManyWithoutPlanNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserSubscriptionCreateWithoutPlanInputSchema),z.lazy(() => UserSubscriptionCreateWithoutPlanInputSchema).array(),z.lazy(() => UserSubscriptionUncheckedCreateWithoutPlanInputSchema),z.lazy(() => UserSubscriptionUncheckedCreateWithoutPlanInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => UserSubscriptionCreateOrConnectWithoutPlanInputSchema),z.lazy(() => UserSubscriptionCreateOrConnectWithoutPlanInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => UserSubscriptionUpsertWithWhereUniqueWithoutPlanInputSchema),z.lazy(() => UserSubscriptionUpsertWithWhereUniqueWithoutPlanInputSchema).array() ]).optional(),
  createMany: z.lazy(() => UserSubscriptionCreateManyPlanInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => UserSubscriptionWhereUniqueInputSchema),z.lazy(() => UserSubscriptionWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => UserSubscriptionWhereUniqueInputSchema),z.lazy(() => UserSubscriptionWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => UserSubscriptionWhereUniqueInputSchema),z.lazy(() => UserSubscriptionWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => UserSubscriptionWhereUniqueInputSchema),z.lazy(() => UserSubscriptionWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => UserSubscriptionUpdateWithWhereUniqueWithoutPlanInputSchema),z.lazy(() => UserSubscriptionUpdateWithWhereUniqueWithoutPlanInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => UserSubscriptionUpdateManyWithWhereWithoutPlanInputSchema),z.lazy(() => UserSubscriptionUpdateManyWithWhereWithoutPlanInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => UserSubscriptionScalarWhereInputSchema),z.lazy(() => UserSubscriptionScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const UserCreateNestedOneWithoutSubscriptionsInputSchema: z.ZodType<Prisma.UserCreateNestedOneWithoutSubscriptionsInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutSubscriptionsInputSchema),z.lazy(() => UserUncheckedCreateWithoutSubscriptionsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutSubscriptionsInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional()
}).strict();

export const SubscriptionPlanCreateNestedOneWithoutSubscriptionsInputSchema: z.ZodType<Prisma.SubscriptionPlanCreateNestedOneWithoutSubscriptionsInput> = z.object({
  create: z.union([ z.lazy(() => SubscriptionPlanCreateWithoutSubscriptionsInputSchema),z.lazy(() => SubscriptionPlanUncheckedCreateWithoutSubscriptionsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => SubscriptionPlanCreateOrConnectWithoutSubscriptionsInputSchema).optional(),
  connect: z.lazy(() => SubscriptionPlanWhereUniqueInputSchema).optional()
}).strict();

export const EnumSubscriptionStatusFieldUpdateOperationsInputSchema: z.ZodType<Prisma.EnumSubscriptionStatusFieldUpdateOperationsInput> = z.object({
  set: z.lazy(() => SubscriptionStatusSchema).optional()
}).strict();

export const UserUpdateOneRequiredWithoutSubscriptionsNestedInputSchema: z.ZodType<Prisma.UserUpdateOneRequiredWithoutSubscriptionsNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutSubscriptionsInputSchema),z.lazy(() => UserUncheckedCreateWithoutSubscriptionsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutSubscriptionsInputSchema).optional(),
  upsert: z.lazy(() => UserUpsertWithoutSubscriptionsInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => UserUpdateToOneWithWhereWithoutSubscriptionsInputSchema),z.lazy(() => UserUpdateWithoutSubscriptionsInputSchema),z.lazy(() => UserUncheckedUpdateWithoutSubscriptionsInputSchema) ]).optional(),
}).strict();

export const SubscriptionPlanUpdateOneRequiredWithoutSubscriptionsNestedInputSchema: z.ZodType<Prisma.SubscriptionPlanUpdateOneRequiredWithoutSubscriptionsNestedInput> = z.object({
  create: z.union([ z.lazy(() => SubscriptionPlanCreateWithoutSubscriptionsInputSchema),z.lazy(() => SubscriptionPlanUncheckedCreateWithoutSubscriptionsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => SubscriptionPlanCreateOrConnectWithoutSubscriptionsInputSchema).optional(),
  upsert: z.lazy(() => SubscriptionPlanUpsertWithoutSubscriptionsInputSchema).optional(),
  connect: z.lazy(() => SubscriptionPlanWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => SubscriptionPlanUpdateToOneWithWhereWithoutSubscriptionsInputSchema),z.lazy(() => SubscriptionPlanUpdateWithoutSubscriptionsInputSchema),z.lazy(() => SubscriptionPlanUncheckedUpdateWithoutSubscriptionsInputSchema) ]).optional(),
}).strict();

export const BlogPostCreateNestedManyWithoutCategoriesInputSchema: z.ZodType<Prisma.BlogPostCreateNestedManyWithoutCategoriesInput> = z.object({
  create: z.union([ z.lazy(() => BlogPostCreateWithoutCategoriesInputSchema),z.lazy(() => BlogPostCreateWithoutCategoriesInputSchema).array(),z.lazy(() => BlogPostUncheckedCreateWithoutCategoriesInputSchema),z.lazy(() => BlogPostUncheckedCreateWithoutCategoriesInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => BlogPostCreateOrConnectWithoutCategoriesInputSchema),z.lazy(() => BlogPostCreateOrConnectWithoutCategoriesInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => BlogPostWhereUniqueInputSchema),z.lazy(() => BlogPostWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const BlogPostUncheckedCreateNestedManyWithoutCategoriesInputSchema: z.ZodType<Prisma.BlogPostUncheckedCreateNestedManyWithoutCategoriesInput> = z.object({
  create: z.union([ z.lazy(() => BlogPostCreateWithoutCategoriesInputSchema),z.lazy(() => BlogPostCreateWithoutCategoriesInputSchema).array(),z.lazy(() => BlogPostUncheckedCreateWithoutCategoriesInputSchema),z.lazy(() => BlogPostUncheckedCreateWithoutCategoriesInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => BlogPostCreateOrConnectWithoutCategoriesInputSchema),z.lazy(() => BlogPostCreateOrConnectWithoutCategoriesInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => BlogPostWhereUniqueInputSchema),z.lazy(() => BlogPostWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const BlogPostUpdateManyWithoutCategoriesNestedInputSchema: z.ZodType<Prisma.BlogPostUpdateManyWithoutCategoriesNestedInput> = z.object({
  create: z.union([ z.lazy(() => BlogPostCreateWithoutCategoriesInputSchema),z.lazy(() => BlogPostCreateWithoutCategoriesInputSchema).array(),z.lazy(() => BlogPostUncheckedCreateWithoutCategoriesInputSchema),z.lazy(() => BlogPostUncheckedCreateWithoutCategoriesInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => BlogPostCreateOrConnectWithoutCategoriesInputSchema),z.lazy(() => BlogPostCreateOrConnectWithoutCategoriesInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => BlogPostUpsertWithWhereUniqueWithoutCategoriesInputSchema),z.lazy(() => BlogPostUpsertWithWhereUniqueWithoutCategoriesInputSchema).array() ]).optional(),
  set: z.union([ z.lazy(() => BlogPostWhereUniqueInputSchema),z.lazy(() => BlogPostWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => BlogPostWhereUniqueInputSchema),z.lazy(() => BlogPostWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => BlogPostWhereUniqueInputSchema),z.lazy(() => BlogPostWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => BlogPostWhereUniqueInputSchema),z.lazy(() => BlogPostWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => BlogPostUpdateWithWhereUniqueWithoutCategoriesInputSchema),z.lazy(() => BlogPostUpdateWithWhereUniqueWithoutCategoriesInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => BlogPostUpdateManyWithWhereWithoutCategoriesInputSchema),z.lazy(() => BlogPostUpdateManyWithWhereWithoutCategoriesInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => BlogPostScalarWhereInputSchema),z.lazy(() => BlogPostScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const BlogPostUncheckedUpdateManyWithoutCategoriesNestedInputSchema: z.ZodType<Prisma.BlogPostUncheckedUpdateManyWithoutCategoriesNestedInput> = z.object({
  create: z.union([ z.lazy(() => BlogPostCreateWithoutCategoriesInputSchema),z.lazy(() => BlogPostCreateWithoutCategoriesInputSchema).array(),z.lazy(() => BlogPostUncheckedCreateWithoutCategoriesInputSchema),z.lazy(() => BlogPostUncheckedCreateWithoutCategoriesInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => BlogPostCreateOrConnectWithoutCategoriesInputSchema),z.lazy(() => BlogPostCreateOrConnectWithoutCategoriesInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => BlogPostUpsertWithWhereUniqueWithoutCategoriesInputSchema),z.lazy(() => BlogPostUpsertWithWhereUniqueWithoutCategoriesInputSchema).array() ]).optional(),
  set: z.union([ z.lazy(() => BlogPostWhereUniqueInputSchema),z.lazy(() => BlogPostWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => BlogPostWhereUniqueInputSchema),z.lazy(() => BlogPostWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => BlogPostWhereUniqueInputSchema),z.lazy(() => BlogPostWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => BlogPostWhereUniqueInputSchema),z.lazy(() => BlogPostWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => BlogPostUpdateWithWhereUniqueWithoutCategoriesInputSchema),z.lazy(() => BlogPostUpdateWithWhereUniqueWithoutCategoriesInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => BlogPostUpdateManyWithWhereWithoutCategoriesInputSchema),z.lazy(() => BlogPostUpdateManyWithWhereWithoutCategoriesInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => BlogPostScalarWhereInputSchema),z.lazy(() => BlogPostScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const NestedStringFilterSchema: z.ZodType<Prisma.NestedStringFilter> = z.object({
  equals: z.string().optional(),
  in: z.string().array().optional(),
  notIn: z.string().array().optional(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringFilterSchema) ]).optional(),
}).strict();

export const NestedBoolFilterSchema: z.ZodType<Prisma.NestedBoolFilter> = z.object({
  equals: z.boolean().optional(),
  not: z.union([ z.boolean(),z.lazy(() => NestedBoolFilterSchema) ]).optional(),
}).strict();

export const NestedStringNullableFilterSchema: z.ZodType<Prisma.NestedStringNullableFilter> = z.object({
  equals: z.string().optional().nullable(),
  in: z.string().array().optional().nullable(),
  notIn: z.string().array().optional().nullable(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringNullableFilterSchema) ]).optional().nullable(),
}).strict();

export const NestedDateTimeFilterSchema: z.ZodType<Prisma.NestedDateTimeFilter> = z.object({
  equals: z.coerce.date().optional(),
  in: z.coerce.date().array().optional(),
  notIn: z.coerce.date().array().optional(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  not: z.union([ z.coerce.date(),z.lazy(() => NestedDateTimeFilterSchema) ]).optional(),
}).strict();

export const NestedBoolNullableFilterSchema: z.ZodType<Prisma.NestedBoolNullableFilter> = z.object({
  equals: z.boolean().optional().nullable(),
  not: z.union([ z.boolean(),z.lazy(() => NestedBoolNullableFilterSchema) ]).optional().nullable(),
}).strict();

export const NestedDateTimeNullableFilterSchema: z.ZodType<Prisma.NestedDateTimeNullableFilter> = z.object({
  equals: z.coerce.date().optional().nullable(),
  in: z.coerce.date().array().optional().nullable(),
  notIn: z.coerce.date().array().optional().nullable(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  not: z.union([ z.coerce.date(),z.lazy(() => NestedDateTimeNullableFilterSchema) ]).optional().nullable(),
}).strict();

export const NestedEnumMembershipLevelFilterSchema: z.ZodType<Prisma.NestedEnumMembershipLevelFilter> = z.object({
  equals: z.lazy(() => MembershipLevelSchema).optional(),
  in: z.lazy(() => MembershipLevelSchema).array().optional(),
  notIn: z.lazy(() => MembershipLevelSchema).array().optional(),
  not: z.union([ z.lazy(() => MembershipLevelSchema),z.lazy(() => NestedEnumMembershipLevelFilterSchema) ]).optional(),
}).strict();

export const NestedStringWithAggregatesFilterSchema: z.ZodType<Prisma.NestedStringWithAggregatesFilter> = z.object({
  equals: z.string().optional(),
  in: z.string().array().optional(),
  notIn: z.string().array().optional(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedStringFilterSchema).optional(),
  _max: z.lazy(() => NestedStringFilterSchema).optional()
}).strict();

export const NestedIntFilterSchema: z.ZodType<Prisma.NestedIntFilter> = z.object({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntFilterSchema) ]).optional(),
}).strict();

export const NestedBoolWithAggregatesFilterSchema: z.ZodType<Prisma.NestedBoolWithAggregatesFilter> = z.object({
  equals: z.boolean().optional(),
  not: z.union([ z.boolean(),z.lazy(() => NestedBoolWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedBoolFilterSchema).optional(),
  _max: z.lazy(() => NestedBoolFilterSchema).optional()
}).strict();

export const NestedStringNullableWithAggregatesFilterSchema: z.ZodType<Prisma.NestedStringNullableWithAggregatesFilter> = z.object({
  equals: z.string().optional().nullable(),
  in: z.string().array().optional().nullable(),
  notIn: z.string().array().optional().nullable(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringNullableWithAggregatesFilterSchema) ]).optional().nullable(),
  _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _min: z.lazy(() => NestedStringNullableFilterSchema).optional(),
  _max: z.lazy(() => NestedStringNullableFilterSchema).optional()
}).strict();

export const NestedIntNullableFilterSchema: z.ZodType<Prisma.NestedIntNullableFilter> = z.object({
  equals: z.number().optional().nullable(),
  in: z.number().array().optional().nullable(),
  notIn: z.number().array().optional().nullable(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntNullableFilterSchema) ]).optional().nullable(),
}).strict();

export const NestedDateTimeWithAggregatesFilterSchema: z.ZodType<Prisma.NestedDateTimeWithAggregatesFilter> = z.object({
  equals: z.coerce.date().optional(),
  in: z.coerce.date().array().optional(),
  notIn: z.coerce.date().array().optional(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  not: z.union([ z.coerce.date(),z.lazy(() => NestedDateTimeWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedDateTimeFilterSchema).optional(),
  _max: z.lazy(() => NestedDateTimeFilterSchema).optional()
}).strict();

export const NestedBoolNullableWithAggregatesFilterSchema: z.ZodType<Prisma.NestedBoolNullableWithAggregatesFilter> = z.object({
  equals: z.boolean().optional().nullable(),
  not: z.union([ z.boolean(),z.lazy(() => NestedBoolNullableWithAggregatesFilterSchema) ]).optional().nullable(),
  _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _min: z.lazy(() => NestedBoolNullableFilterSchema).optional(),
  _max: z.lazy(() => NestedBoolNullableFilterSchema).optional()
}).strict();

export const NestedDateTimeNullableWithAggregatesFilterSchema: z.ZodType<Prisma.NestedDateTimeNullableWithAggregatesFilter> = z.object({
  equals: z.coerce.date().optional().nullable(),
  in: z.coerce.date().array().optional().nullable(),
  notIn: z.coerce.date().array().optional().nullable(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  not: z.union([ z.coerce.date(),z.lazy(() => NestedDateTimeNullableWithAggregatesFilterSchema) ]).optional().nullable(),
  _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _min: z.lazy(() => NestedDateTimeNullableFilterSchema).optional(),
  _max: z.lazy(() => NestedDateTimeNullableFilterSchema).optional()
}).strict();

export const NestedEnumMembershipLevelWithAggregatesFilterSchema: z.ZodType<Prisma.NestedEnumMembershipLevelWithAggregatesFilter> = z.object({
  equals: z.lazy(() => MembershipLevelSchema).optional(),
  in: z.lazy(() => MembershipLevelSchema).array().optional(),
  notIn: z.lazy(() => MembershipLevelSchema).array().optional(),
  not: z.union([ z.lazy(() => MembershipLevelSchema),z.lazy(() => NestedEnumMembershipLevelWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumMembershipLevelFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumMembershipLevelFilterSchema).optional()
}).strict();

export const NestedIntWithAggregatesFilterSchema: z.ZodType<Prisma.NestedIntWithAggregatesFilter> = z.object({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _avg: z.lazy(() => NestedFloatFilterSchema).optional(),
  _sum: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedIntFilterSchema).optional(),
  _max: z.lazy(() => NestedIntFilterSchema).optional()
}).strict();

export const NestedFloatFilterSchema: z.ZodType<Prisma.NestedFloatFilter> = z.object({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedFloatFilterSchema) ]).optional(),
}).strict();

export const NestedEnumPurchaseTypeFilterSchema: z.ZodType<Prisma.NestedEnumPurchaseTypeFilter> = z.object({
  equals: z.lazy(() => PurchaseTypeSchema).optional(),
  in: z.lazy(() => PurchaseTypeSchema).array().optional(),
  notIn: z.lazy(() => PurchaseTypeSchema).array().optional(),
  not: z.union([ z.lazy(() => PurchaseTypeSchema),z.lazy(() => NestedEnumPurchaseTypeFilterSchema) ]).optional(),
}).strict();

export const NestedEnumPurchaseTypeWithAggregatesFilterSchema: z.ZodType<Prisma.NestedEnumPurchaseTypeWithAggregatesFilter> = z.object({
  equals: z.lazy(() => PurchaseTypeSchema).optional(),
  in: z.lazy(() => PurchaseTypeSchema).array().optional(),
  notIn: z.lazy(() => PurchaseTypeSchema).array().optional(),
  not: z.union([ z.lazy(() => PurchaseTypeSchema),z.lazy(() => NestedEnumPurchaseTypeWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumPurchaseTypeFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumPurchaseTypeFilterSchema).optional()
}).strict();

export const NestedJsonFilterSchema: z.ZodType<Prisma.NestedJsonFilter> = z.object({
  equals: InputJsonValueSchema.optional(),
  path: z.string().array().optional(),
  mode: z.lazy(() => QueryModeSchema).optional(),
  string_contains: z.string().optional(),
  string_starts_with: z.string().optional(),
  string_ends_with: z.string().optional(),
  array_starts_with: InputJsonValueSchema.optional().nullable(),
  array_ends_with: InputJsonValueSchema.optional().nullable(),
  array_contains: InputJsonValueSchema.optional().nullable(),
  lt: InputJsonValueSchema.optional(),
  lte: InputJsonValueSchema.optional(),
  gt: InputJsonValueSchema.optional(),
  gte: InputJsonValueSchema.optional(),
  not: InputJsonValueSchema.optional()
}).strict();

export const NestedEnumAccessLevelFilterSchema: z.ZodType<Prisma.NestedEnumAccessLevelFilter> = z.object({
  equals: z.lazy(() => AccessLevelSchema).optional(),
  in: z.lazy(() => AccessLevelSchema).array().optional(),
  notIn: z.lazy(() => AccessLevelSchema).array().optional(),
  not: z.union([ z.lazy(() => AccessLevelSchema),z.lazy(() => NestedEnumAccessLevelFilterSchema) ]).optional(),
}).strict();

export const NestedEnumAccessLevelWithAggregatesFilterSchema: z.ZodType<Prisma.NestedEnumAccessLevelWithAggregatesFilter> = z.object({
  equals: z.lazy(() => AccessLevelSchema).optional(),
  in: z.lazy(() => AccessLevelSchema).array().optional(),
  notIn: z.lazy(() => AccessLevelSchema).array().optional(),
  not: z.union([ z.lazy(() => AccessLevelSchema),z.lazy(() => NestedEnumAccessLevelWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumAccessLevelFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumAccessLevelFilterSchema).optional()
}).strict();

export const NestedDecimalFilterSchema: z.ZodType<Prisma.NestedDecimalFilter> = z.object({
  equals: z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  in: z.union([z.number().array(),z.string().array(),z.instanceof(Decimal).array(),z.instanceof(Prisma.Decimal).array(),DecimalJsLikeSchema.array(),]).refine((v) => Array.isArray(v) && (v as any[]).every((v) => isValidDecimalInput(v)), { message: 'Must be a Decimal' }).optional(),
  notIn: z.union([z.number().array(),z.string().array(),z.instanceof(Decimal).array(),z.instanceof(Prisma.Decimal).array(),DecimalJsLikeSchema.array(),]).refine((v) => Array.isArray(v) && (v as any[]).every((v) => isValidDecimalInput(v)), { message: 'Must be a Decimal' }).optional(),
  lt: z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  lte: z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  gt: z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  gte: z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  not: z.union([ z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => NestedDecimalFilterSchema) ]).optional(),
}).strict();

export const NestedEnumPlanIntervalFilterSchema: z.ZodType<Prisma.NestedEnumPlanIntervalFilter> = z.object({
  equals: z.lazy(() => PlanIntervalSchema).optional(),
  in: z.lazy(() => PlanIntervalSchema).array().optional(),
  notIn: z.lazy(() => PlanIntervalSchema).array().optional(),
  not: z.union([ z.lazy(() => PlanIntervalSchema),z.lazy(() => NestedEnumPlanIntervalFilterSchema) ]).optional(),
}).strict();

export const NestedDecimalWithAggregatesFilterSchema: z.ZodType<Prisma.NestedDecimalWithAggregatesFilter> = z.object({
  equals: z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  in: z.union([z.number().array(),z.string().array(),z.instanceof(Decimal).array(),z.instanceof(Prisma.Decimal).array(),DecimalJsLikeSchema.array(),]).refine((v) => Array.isArray(v) && (v as any[]).every((v) => isValidDecimalInput(v)), { message: 'Must be a Decimal' }).optional(),
  notIn: z.union([z.number().array(),z.string().array(),z.instanceof(Decimal).array(),z.instanceof(Prisma.Decimal).array(),DecimalJsLikeSchema.array(),]).refine((v) => Array.isArray(v) && (v as any[]).every((v) => isValidDecimalInput(v)), { message: 'Must be a Decimal' }).optional(),
  lt: z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  lte: z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  gt: z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  gte: z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  not: z.union([ z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => NestedDecimalWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _avg: z.lazy(() => NestedDecimalFilterSchema).optional(),
  _sum: z.lazy(() => NestedDecimalFilterSchema).optional(),
  _min: z.lazy(() => NestedDecimalFilterSchema).optional(),
  _max: z.lazy(() => NestedDecimalFilterSchema).optional()
}).strict();

export const NestedEnumPlanIntervalWithAggregatesFilterSchema: z.ZodType<Prisma.NestedEnumPlanIntervalWithAggregatesFilter> = z.object({
  equals: z.lazy(() => PlanIntervalSchema).optional(),
  in: z.lazy(() => PlanIntervalSchema).array().optional(),
  notIn: z.lazy(() => PlanIntervalSchema).array().optional(),
  not: z.union([ z.lazy(() => PlanIntervalSchema),z.lazy(() => NestedEnumPlanIntervalWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumPlanIntervalFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumPlanIntervalFilterSchema).optional()
}).strict();

export const NestedEnumSubscriptionStatusFilterSchema: z.ZodType<Prisma.NestedEnumSubscriptionStatusFilter> = z.object({
  equals: z.lazy(() => SubscriptionStatusSchema).optional(),
  in: z.lazy(() => SubscriptionStatusSchema).array().optional(),
  notIn: z.lazy(() => SubscriptionStatusSchema).array().optional(),
  not: z.union([ z.lazy(() => SubscriptionStatusSchema),z.lazy(() => NestedEnumSubscriptionStatusFilterSchema) ]).optional(),
}).strict();

export const NestedEnumSubscriptionStatusWithAggregatesFilterSchema: z.ZodType<Prisma.NestedEnumSubscriptionStatusWithAggregatesFilter> = z.object({
  equals: z.lazy(() => SubscriptionStatusSchema).optional(),
  in: z.lazy(() => SubscriptionStatusSchema).array().optional(),
  notIn: z.lazy(() => SubscriptionStatusSchema).array().optional(),
  not: z.union([ z.lazy(() => SubscriptionStatusSchema),z.lazy(() => NestedEnumSubscriptionStatusWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumSubscriptionStatusFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumSubscriptionStatusFilterSchema).optional()
}).strict();

export const SessionCreateWithoutUserInputSchema: z.ZodType<Prisma.SessionCreateWithoutUserInput> = z.object({
  id: z.string().cuid().optional(),
  expiresAt: z.coerce.date(),
  ipAddress: z.string().optional().nullable(),
  userAgent: z.string().optional().nullable(),
  impersonatedBy: z.string().optional().nullable(),
  activeOrganizationId: z.string().optional().nullable(),
  token: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date()
}).strict();

export const SessionUncheckedCreateWithoutUserInputSchema: z.ZodType<Prisma.SessionUncheckedCreateWithoutUserInput> = z.object({
  id: z.string().cuid().optional(),
  expiresAt: z.coerce.date(),
  ipAddress: z.string().optional().nullable(),
  userAgent: z.string().optional().nullable(),
  impersonatedBy: z.string().optional().nullable(),
  activeOrganizationId: z.string().optional().nullable(),
  token: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date()
}).strict();

export const SessionCreateOrConnectWithoutUserInputSchema: z.ZodType<Prisma.SessionCreateOrConnectWithoutUserInput> = z.object({
  where: z.lazy(() => SessionWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => SessionCreateWithoutUserInputSchema),z.lazy(() => SessionUncheckedCreateWithoutUserInputSchema) ]),
}).strict();

export const SessionCreateManyUserInputEnvelopeSchema: z.ZodType<Prisma.SessionCreateManyUserInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => SessionCreateManyUserInputSchema),z.lazy(() => SessionCreateManyUserInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export const AccountCreateWithoutUserInputSchema: z.ZodType<Prisma.AccountCreateWithoutUserInput> = z.object({
  id: z.string().cuid().optional(),
  accountId: z.string(),
  providerId: z.string(),
  accessToken: z.string().optional().nullable(),
  refreshToken: z.string().optional().nullable(),
  idToken: z.string().optional().nullable(),
  expiresAt: z.coerce.date().optional().nullable(),
  password: z.string().optional().nullable(),
  accessTokenExpiresAt: z.coerce.date().optional().nullable(),
  refreshTokenExpiresAt: z.coerce.date().optional().nullable(),
  scope: z.string().optional().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date()
}).strict();

export const AccountUncheckedCreateWithoutUserInputSchema: z.ZodType<Prisma.AccountUncheckedCreateWithoutUserInput> = z.object({
  id: z.string().cuid().optional(),
  accountId: z.string(),
  providerId: z.string(),
  accessToken: z.string().optional().nullable(),
  refreshToken: z.string().optional().nullable(),
  idToken: z.string().optional().nullable(),
  expiresAt: z.coerce.date().optional().nullable(),
  password: z.string().optional().nullable(),
  accessTokenExpiresAt: z.coerce.date().optional().nullable(),
  refreshTokenExpiresAt: z.coerce.date().optional().nullable(),
  scope: z.string().optional().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date()
}).strict();

export const AccountCreateOrConnectWithoutUserInputSchema: z.ZodType<Prisma.AccountCreateOrConnectWithoutUserInput> = z.object({
  where: z.lazy(() => AccountWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => AccountCreateWithoutUserInputSchema),z.lazy(() => AccountUncheckedCreateWithoutUserInputSchema) ]),
}).strict();

export const AccountCreateManyUserInputEnvelopeSchema: z.ZodType<Prisma.AccountCreateManyUserInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => AccountCreateManyUserInputSchema),z.lazy(() => AccountCreateManyUserInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export const PasskeyCreateWithoutUserInputSchema: z.ZodType<Prisma.PasskeyCreateWithoutUserInput> = z.object({
  id: z.string().cuid().optional(),
  name: z.string().optional().nullable(),
  publicKey: z.string(),
  credentialID: z.string(),
  counter: z.number().int(),
  deviceType: z.string(),
  backedUp: z.boolean(),
  transports: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional().nullable()
}).strict();

export const PasskeyUncheckedCreateWithoutUserInputSchema: z.ZodType<Prisma.PasskeyUncheckedCreateWithoutUserInput> = z.object({
  id: z.string().cuid().optional(),
  name: z.string().optional().nullable(),
  publicKey: z.string(),
  credentialID: z.string(),
  counter: z.number().int(),
  deviceType: z.string(),
  backedUp: z.boolean(),
  transports: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional().nullable()
}).strict();

export const PasskeyCreateOrConnectWithoutUserInputSchema: z.ZodType<Prisma.PasskeyCreateOrConnectWithoutUserInput> = z.object({
  where: z.lazy(() => PasskeyWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => PasskeyCreateWithoutUserInputSchema),z.lazy(() => PasskeyUncheckedCreateWithoutUserInputSchema) ]),
}).strict();

export const PasskeyCreateManyUserInputEnvelopeSchema: z.ZodType<Prisma.PasskeyCreateManyUserInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => PasskeyCreateManyUserInputSchema),z.lazy(() => PasskeyCreateManyUserInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export const InvitationCreateWithoutUserInputSchema: z.ZodType<Prisma.InvitationCreateWithoutUserInput> = z.object({
  id: z.string().cuid().optional(),
  email: z.string(),
  role: z.string().optional().nullable(),
  status: z.string(),
  expiresAt: z.coerce.date(),
  organization: z.lazy(() => OrganizationCreateNestedOneWithoutInvitationsInputSchema)
}).strict();

export const InvitationUncheckedCreateWithoutUserInputSchema: z.ZodType<Prisma.InvitationUncheckedCreateWithoutUserInput> = z.object({
  id: z.string().cuid().optional(),
  organizationId: z.string(),
  email: z.string(),
  role: z.string().optional().nullable(),
  status: z.string(),
  expiresAt: z.coerce.date()
}).strict();

export const InvitationCreateOrConnectWithoutUserInputSchema: z.ZodType<Prisma.InvitationCreateOrConnectWithoutUserInput> = z.object({
  where: z.lazy(() => InvitationWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => InvitationCreateWithoutUserInputSchema),z.lazy(() => InvitationUncheckedCreateWithoutUserInputSchema) ]),
}).strict();

export const InvitationCreateManyUserInputEnvelopeSchema: z.ZodType<Prisma.InvitationCreateManyUserInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => InvitationCreateManyUserInputSchema),z.lazy(() => InvitationCreateManyUserInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export const PurchaseCreateWithoutUserInputSchema: z.ZodType<Prisma.PurchaseCreateWithoutUserInput> = z.object({
  id: z.string().cuid().optional(),
  type: z.lazy(() => PurchaseTypeSchema),
  customerId: z.string(),
  subscriptionId: z.string().optional().nullable(),
  productId: z.string(),
  status: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  organization: z.lazy(() => OrganizationCreateNestedOneWithoutPurchasesInputSchema).optional()
}).strict();

export const PurchaseUncheckedCreateWithoutUserInputSchema: z.ZodType<Prisma.PurchaseUncheckedCreateWithoutUserInput> = z.object({
  id: z.string().cuid().optional(),
  organizationId: z.string().optional().nullable(),
  type: z.lazy(() => PurchaseTypeSchema),
  customerId: z.string(),
  subscriptionId: z.string().optional().nullable(),
  productId: z.string(),
  status: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional()
}).strict();

export const PurchaseCreateOrConnectWithoutUserInputSchema: z.ZodType<Prisma.PurchaseCreateOrConnectWithoutUserInput> = z.object({
  where: z.lazy(() => PurchaseWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => PurchaseCreateWithoutUserInputSchema),z.lazy(() => PurchaseUncheckedCreateWithoutUserInputSchema) ]),
}).strict();

export const PurchaseCreateManyUserInputEnvelopeSchema: z.ZodType<Prisma.PurchaseCreateManyUserInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => PurchaseCreateManyUserInputSchema),z.lazy(() => PurchaseCreateManyUserInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export const MemberCreateWithoutUserInputSchema: z.ZodType<Prisma.MemberCreateWithoutUserInput> = z.object({
  id: z.string().cuid().optional(),
  role: z.string(),
  createdAt: z.coerce.date(),
  organization: z.lazy(() => OrganizationCreateNestedOneWithoutMembersInputSchema)
}).strict();

export const MemberUncheckedCreateWithoutUserInputSchema: z.ZodType<Prisma.MemberUncheckedCreateWithoutUserInput> = z.object({
  id: z.string().cuid().optional(),
  organizationId: z.string(),
  role: z.string(),
  createdAt: z.coerce.date()
}).strict();

export const MemberCreateOrConnectWithoutUserInputSchema: z.ZodType<Prisma.MemberCreateOrConnectWithoutUserInput> = z.object({
  where: z.lazy(() => MemberWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => MemberCreateWithoutUserInputSchema),z.lazy(() => MemberUncheckedCreateWithoutUserInputSchema) ]),
}).strict();

export const MemberCreateManyUserInputEnvelopeSchema: z.ZodType<Prisma.MemberCreateManyUserInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => MemberCreateManyUserInputSchema),z.lazy(() => MemberCreateManyUserInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export const AiChatCreateWithoutUserInputSchema: z.ZodType<Prisma.AiChatCreateWithoutUserInput> = z.object({
  id: z.string().cuid().optional(),
  title: z.string().optional().nullable(),
  messages: z.union([ z.lazy(() => JsonNullValueInputSchema),z.array(z.object({ role: z.enum(['user', 'assistant']), content: z.string() })) ]).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  organization: z.lazy(() => OrganizationCreateNestedOneWithoutAiChatsInputSchema).optional()
}).strict();

export const AiChatUncheckedCreateWithoutUserInputSchema: z.ZodType<Prisma.AiChatUncheckedCreateWithoutUserInput> = z.object({
  id: z.string().cuid().optional(),
  organizationId: z.string().optional().nullable(),
  title: z.string().optional().nullable(),
  messages: z.union([ z.lazy(() => JsonNullValueInputSchema),z.array(z.object({ role: z.enum(['user', 'assistant']), content: z.string() })) ]).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional()
}).strict();

export const AiChatCreateOrConnectWithoutUserInputSchema: z.ZodType<Prisma.AiChatCreateOrConnectWithoutUserInput> = z.object({
  where: z.lazy(() => AiChatWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => AiChatCreateWithoutUserInputSchema),z.lazy(() => AiChatUncheckedCreateWithoutUserInputSchema) ]),
}).strict();

export const AiChatCreateManyUserInputEnvelopeSchema: z.ZodType<Prisma.AiChatCreateManyUserInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => AiChatCreateManyUserInputSchema),z.lazy(() => AiChatCreateManyUserInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export const UserSubscriptionCreateWithoutUserInputSchema: z.ZodType<Prisma.UserSubscriptionCreateWithoutUserInput> = z.object({
  id: z.string().cuid().optional(),
  status: z.lazy(() => SubscriptionStatusSchema),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional().nullable(),
  cancelledAt: z.coerce.date().optional().nullable(),
  paymentId: z.string().optional().nullable(),
  paymentMethod: z.string().optional().nullable(),
  amount: z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  autoRenew: z.boolean().optional(),
  nextBillingDate: z.coerce.date().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  plan: z.lazy(() => SubscriptionPlanCreateNestedOneWithoutSubscriptionsInputSchema)
}).strict();

export const UserSubscriptionUncheckedCreateWithoutUserInputSchema: z.ZodType<Prisma.UserSubscriptionUncheckedCreateWithoutUserInput> = z.object({
  id: z.string().cuid().optional(),
  planId: z.string(),
  status: z.lazy(() => SubscriptionStatusSchema),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional().nullable(),
  cancelledAt: z.coerce.date().optional().nullable(),
  paymentId: z.string().optional().nullable(),
  paymentMethod: z.string().optional().nullable(),
  amount: z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  autoRenew: z.boolean().optional(),
  nextBillingDate: z.coerce.date().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional()
}).strict();

export const UserSubscriptionCreateOrConnectWithoutUserInputSchema: z.ZodType<Prisma.UserSubscriptionCreateOrConnectWithoutUserInput> = z.object({
  where: z.lazy(() => UserSubscriptionWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserSubscriptionCreateWithoutUserInputSchema),z.lazy(() => UserSubscriptionUncheckedCreateWithoutUserInputSchema) ]),
}).strict();

export const UserSubscriptionCreateManyUserInputEnvelopeSchema: z.ZodType<Prisma.UserSubscriptionCreateManyUserInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => UserSubscriptionCreateManyUserInputSchema),z.lazy(() => UserSubscriptionCreateManyUserInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export const BlogPostCreateWithoutAuthorInputSchema: z.ZodType<Prisma.BlogPostCreateWithoutAuthorInput> = z.object({
  id: z.string().cuid().optional(),
  slug: z.string(),
  title: z.string(),
  excerpt: z.string().optional().nullable(),
  content: z.string(),
  image: z.string().optional().nullable(),
  accessLevel: z.lazy(() => AccessLevelSchema).optional(),
  previewContent: z.string().optional().nullable(),
  tags: z.union([ z.lazy(() => BlogPostCreatetagsInputSchema),z.string().array() ]).optional(),
  published: z.boolean().optional(),
  publishedAt: z.coerce.date().optional().nullable(),
  viewCount: z.number().int().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  categories: z.lazy(() => BlogCategoryCreateNestedManyWithoutPostsInputSchema).optional()
}).strict();

export const BlogPostUncheckedCreateWithoutAuthorInputSchema: z.ZodType<Prisma.BlogPostUncheckedCreateWithoutAuthorInput> = z.object({
  id: z.string().cuid().optional(),
  slug: z.string(),
  title: z.string(),
  excerpt: z.string().optional().nullable(),
  content: z.string(),
  image: z.string().optional().nullable(),
  accessLevel: z.lazy(() => AccessLevelSchema).optional(),
  previewContent: z.string().optional().nullable(),
  tags: z.union([ z.lazy(() => BlogPostCreatetagsInputSchema),z.string().array() ]).optional(),
  published: z.boolean().optional(),
  publishedAt: z.coerce.date().optional().nullable(),
  viewCount: z.number().int().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  categories: z.lazy(() => BlogCategoryUncheckedCreateNestedManyWithoutPostsInputSchema).optional()
}).strict();

export const BlogPostCreateOrConnectWithoutAuthorInputSchema: z.ZodType<Prisma.BlogPostCreateOrConnectWithoutAuthorInput> = z.object({
  where: z.lazy(() => BlogPostWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => BlogPostCreateWithoutAuthorInputSchema),z.lazy(() => BlogPostUncheckedCreateWithoutAuthorInputSchema) ]),
}).strict();

export const BlogPostCreateManyAuthorInputEnvelopeSchema: z.ZodType<Prisma.BlogPostCreateManyAuthorInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => BlogPostCreateManyAuthorInputSchema),z.lazy(() => BlogPostCreateManyAuthorInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export const SessionUpsertWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.SessionUpsertWithWhereUniqueWithoutUserInput> = z.object({
  where: z.lazy(() => SessionWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => SessionUpdateWithoutUserInputSchema),z.lazy(() => SessionUncheckedUpdateWithoutUserInputSchema) ]),
  create: z.union([ z.lazy(() => SessionCreateWithoutUserInputSchema),z.lazy(() => SessionUncheckedCreateWithoutUserInputSchema) ]),
}).strict();

export const SessionUpdateWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.SessionUpdateWithWhereUniqueWithoutUserInput> = z.object({
  where: z.lazy(() => SessionWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => SessionUpdateWithoutUserInputSchema),z.lazy(() => SessionUncheckedUpdateWithoutUserInputSchema) ]),
}).strict();

export const SessionUpdateManyWithWhereWithoutUserInputSchema: z.ZodType<Prisma.SessionUpdateManyWithWhereWithoutUserInput> = z.object({
  where: z.lazy(() => SessionScalarWhereInputSchema),
  data: z.union([ z.lazy(() => SessionUpdateManyMutationInputSchema),z.lazy(() => SessionUncheckedUpdateManyWithoutUserInputSchema) ]),
}).strict();

export const SessionScalarWhereInputSchema: z.ZodType<Prisma.SessionScalarWhereInput> = z.object({
  AND: z.union([ z.lazy(() => SessionScalarWhereInputSchema),z.lazy(() => SessionScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => SessionScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => SessionScalarWhereInputSchema),z.lazy(() => SessionScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  expiresAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  ipAddress: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  userAgent: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  userId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  impersonatedBy: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  activeOrganizationId: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  token: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
}).strict();

export const AccountUpsertWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.AccountUpsertWithWhereUniqueWithoutUserInput> = z.object({
  where: z.lazy(() => AccountWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => AccountUpdateWithoutUserInputSchema),z.lazy(() => AccountUncheckedUpdateWithoutUserInputSchema) ]),
  create: z.union([ z.lazy(() => AccountCreateWithoutUserInputSchema),z.lazy(() => AccountUncheckedCreateWithoutUserInputSchema) ]),
}).strict();

export const AccountUpdateWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.AccountUpdateWithWhereUniqueWithoutUserInput> = z.object({
  where: z.lazy(() => AccountWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => AccountUpdateWithoutUserInputSchema),z.lazy(() => AccountUncheckedUpdateWithoutUserInputSchema) ]),
}).strict();

export const AccountUpdateManyWithWhereWithoutUserInputSchema: z.ZodType<Prisma.AccountUpdateManyWithWhereWithoutUserInput> = z.object({
  where: z.lazy(() => AccountScalarWhereInputSchema),
  data: z.union([ z.lazy(() => AccountUpdateManyMutationInputSchema),z.lazy(() => AccountUncheckedUpdateManyWithoutUserInputSchema) ]),
}).strict();

export const AccountScalarWhereInputSchema: z.ZodType<Prisma.AccountScalarWhereInput> = z.object({
  AND: z.union([ z.lazy(() => AccountScalarWhereInputSchema),z.lazy(() => AccountScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => AccountScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => AccountScalarWhereInputSchema),z.lazy(() => AccountScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  accountId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  providerId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  accessToken: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  refreshToken: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  idToken: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  expiresAt: z.union([ z.lazy(() => DateTimeNullableFilterSchema),z.coerce.date() ]).optional().nullable(),
  password: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  accessTokenExpiresAt: z.union([ z.lazy(() => DateTimeNullableFilterSchema),z.coerce.date() ]).optional().nullable(),
  refreshTokenExpiresAt: z.union([ z.lazy(() => DateTimeNullableFilterSchema),z.coerce.date() ]).optional().nullable(),
  scope: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
}).strict();

export const PasskeyUpsertWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.PasskeyUpsertWithWhereUniqueWithoutUserInput> = z.object({
  where: z.lazy(() => PasskeyWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => PasskeyUpdateWithoutUserInputSchema),z.lazy(() => PasskeyUncheckedUpdateWithoutUserInputSchema) ]),
  create: z.union([ z.lazy(() => PasskeyCreateWithoutUserInputSchema),z.lazy(() => PasskeyUncheckedCreateWithoutUserInputSchema) ]),
}).strict();

export const PasskeyUpdateWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.PasskeyUpdateWithWhereUniqueWithoutUserInput> = z.object({
  where: z.lazy(() => PasskeyWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => PasskeyUpdateWithoutUserInputSchema),z.lazy(() => PasskeyUncheckedUpdateWithoutUserInputSchema) ]),
}).strict();

export const PasskeyUpdateManyWithWhereWithoutUserInputSchema: z.ZodType<Prisma.PasskeyUpdateManyWithWhereWithoutUserInput> = z.object({
  where: z.lazy(() => PasskeyScalarWhereInputSchema),
  data: z.union([ z.lazy(() => PasskeyUpdateManyMutationInputSchema),z.lazy(() => PasskeyUncheckedUpdateManyWithoutUserInputSchema) ]),
}).strict();

export const PasskeyScalarWhereInputSchema: z.ZodType<Prisma.PasskeyScalarWhereInput> = z.object({
  AND: z.union([ z.lazy(() => PasskeyScalarWhereInputSchema),z.lazy(() => PasskeyScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => PasskeyScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => PasskeyScalarWhereInputSchema),z.lazy(() => PasskeyScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  name: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  publicKey: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  credentialID: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  counter: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  deviceType: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  backedUp: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  transports: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  createdAt: z.union([ z.lazy(() => DateTimeNullableFilterSchema),z.coerce.date() ]).optional().nullable(),
}).strict();

export const InvitationUpsertWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.InvitationUpsertWithWhereUniqueWithoutUserInput> = z.object({
  where: z.lazy(() => InvitationWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => InvitationUpdateWithoutUserInputSchema),z.lazy(() => InvitationUncheckedUpdateWithoutUserInputSchema) ]),
  create: z.union([ z.lazy(() => InvitationCreateWithoutUserInputSchema),z.lazy(() => InvitationUncheckedCreateWithoutUserInputSchema) ]),
}).strict();

export const InvitationUpdateWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.InvitationUpdateWithWhereUniqueWithoutUserInput> = z.object({
  where: z.lazy(() => InvitationWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => InvitationUpdateWithoutUserInputSchema),z.lazy(() => InvitationUncheckedUpdateWithoutUserInputSchema) ]),
}).strict();

export const InvitationUpdateManyWithWhereWithoutUserInputSchema: z.ZodType<Prisma.InvitationUpdateManyWithWhereWithoutUserInput> = z.object({
  where: z.lazy(() => InvitationScalarWhereInputSchema),
  data: z.union([ z.lazy(() => InvitationUpdateManyMutationInputSchema),z.lazy(() => InvitationUncheckedUpdateManyWithoutUserInputSchema) ]),
}).strict();

export const InvitationScalarWhereInputSchema: z.ZodType<Prisma.InvitationScalarWhereInput> = z.object({
  AND: z.union([ z.lazy(() => InvitationScalarWhereInputSchema),z.lazy(() => InvitationScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => InvitationScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => InvitationScalarWhereInputSchema),z.lazy(() => InvitationScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  organizationId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  email: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  role: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  status: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  expiresAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  inviterId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
}).strict();

export const PurchaseUpsertWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.PurchaseUpsertWithWhereUniqueWithoutUserInput> = z.object({
  where: z.lazy(() => PurchaseWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => PurchaseUpdateWithoutUserInputSchema),z.lazy(() => PurchaseUncheckedUpdateWithoutUserInputSchema) ]),
  create: z.union([ z.lazy(() => PurchaseCreateWithoutUserInputSchema),z.lazy(() => PurchaseUncheckedCreateWithoutUserInputSchema) ]),
}).strict();

export const PurchaseUpdateWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.PurchaseUpdateWithWhereUniqueWithoutUserInput> = z.object({
  where: z.lazy(() => PurchaseWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => PurchaseUpdateWithoutUserInputSchema),z.lazy(() => PurchaseUncheckedUpdateWithoutUserInputSchema) ]),
}).strict();

export const PurchaseUpdateManyWithWhereWithoutUserInputSchema: z.ZodType<Prisma.PurchaseUpdateManyWithWhereWithoutUserInput> = z.object({
  where: z.lazy(() => PurchaseScalarWhereInputSchema),
  data: z.union([ z.lazy(() => PurchaseUpdateManyMutationInputSchema),z.lazy(() => PurchaseUncheckedUpdateManyWithoutUserInputSchema) ]),
}).strict();

export const PurchaseScalarWhereInputSchema: z.ZodType<Prisma.PurchaseScalarWhereInput> = z.object({
  AND: z.union([ z.lazy(() => PurchaseScalarWhereInputSchema),z.lazy(() => PurchaseScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => PurchaseScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => PurchaseScalarWhereInputSchema),z.lazy(() => PurchaseScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  organizationId: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  userId: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  type: z.union([ z.lazy(() => EnumPurchaseTypeFilterSchema),z.lazy(() => PurchaseTypeSchema) ]).optional(),
  customerId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  subscriptionId: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  productId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  status: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
}).strict();

export const MemberUpsertWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.MemberUpsertWithWhereUniqueWithoutUserInput> = z.object({
  where: z.lazy(() => MemberWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => MemberUpdateWithoutUserInputSchema),z.lazy(() => MemberUncheckedUpdateWithoutUserInputSchema) ]),
  create: z.union([ z.lazy(() => MemberCreateWithoutUserInputSchema),z.lazy(() => MemberUncheckedCreateWithoutUserInputSchema) ]),
}).strict();

export const MemberUpdateWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.MemberUpdateWithWhereUniqueWithoutUserInput> = z.object({
  where: z.lazy(() => MemberWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => MemberUpdateWithoutUserInputSchema),z.lazy(() => MemberUncheckedUpdateWithoutUserInputSchema) ]),
}).strict();

export const MemberUpdateManyWithWhereWithoutUserInputSchema: z.ZodType<Prisma.MemberUpdateManyWithWhereWithoutUserInput> = z.object({
  where: z.lazy(() => MemberScalarWhereInputSchema),
  data: z.union([ z.lazy(() => MemberUpdateManyMutationInputSchema),z.lazy(() => MemberUncheckedUpdateManyWithoutUserInputSchema) ]),
}).strict();

export const MemberScalarWhereInputSchema: z.ZodType<Prisma.MemberScalarWhereInput> = z.object({
  AND: z.union([ z.lazy(() => MemberScalarWhereInputSchema),z.lazy(() => MemberScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => MemberScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => MemberScalarWhereInputSchema),z.lazy(() => MemberScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  organizationId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  role: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
}).strict();

export const AiChatUpsertWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.AiChatUpsertWithWhereUniqueWithoutUserInput> = z.object({
  where: z.lazy(() => AiChatWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => AiChatUpdateWithoutUserInputSchema),z.lazy(() => AiChatUncheckedUpdateWithoutUserInputSchema) ]),
  create: z.union([ z.lazy(() => AiChatCreateWithoutUserInputSchema),z.lazy(() => AiChatUncheckedCreateWithoutUserInputSchema) ]),
}).strict();

export const AiChatUpdateWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.AiChatUpdateWithWhereUniqueWithoutUserInput> = z.object({
  where: z.lazy(() => AiChatWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => AiChatUpdateWithoutUserInputSchema),z.lazy(() => AiChatUncheckedUpdateWithoutUserInputSchema) ]),
}).strict();

export const AiChatUpdateManyWithWhereWithoutUserInputSchema: z.ZodType<Prisma.AiChatUpdateManyWithWhereWithoutUserInput> = z.object({
  where: z.lazy(() => AiChatScalarWhereInputSchema),
  data: z.union([ z.lazy(() => AiChatUpdateManyMutationInputSchema),z.lazy(() => AiChatUncheckedUpdateManyWithoutUserInputSchema) ]),
}).strict();

export const AiChatScalarWhereInputSchema: z.ZodType<Prisma.AiChatScalarWhereInput> = z.object({
  AND: z.union([ z.lazy(() => AiChatScalarWhereInputSchema),z.lazy(() => AiChatScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => AiChatScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => AiChatScalarWhereInputSchema),z.lazy(() => AiChatScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  organizationId: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  userId: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  title: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  messages: z.lazy(() => JsonFilterSchema).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
}).strict();

export const UserSubscriptionUpsertWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.UserSubscriptionUpsertWithWhereUniqueWithoutUserInput> = z.object({
  where: z.lazy(() => UserSubscriptionWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => UserSubscriptionUpdateWithoutUserInputSchema),z.lazy(() => UserSubscriptionUncheckedUpdateWithoutUserInputSchema) ]),
  create: z.union([ z.lazy(() => UserSubscriptionCreateWithoutUserInputSchema),z.lazy(() => UserSubscriptionUncheckedCreateWithoutUserInputSchema) ]),
}).strict();

export const UserSubscriptionUpdateWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.UserSubscriptionUpdateWithWhereUniqueWithoutUserInput> = z.object({
  where: z.lazy(() => UserSubscriptionWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => UserSubscriptionUpdateWithoutUserInputSchema),z.lazy(() => UserSubscriptionUncheckedUpdateWithoutUserInputSchema) ]),
}).strict();

export const UserSubscriptionUpdateManyWithWhereWithoutUserInputSchema: z.ZodType<Prisma.UserSubscriptionUpdateManyWithWhereWithoutUserInput> = z.object({
  where: z.lazy(() => UserSubscriptionScalarWhereInputSchema),
  data: z.union([ z.lazy(() => UserSubscriptionUpdateManyMutationInputSchema),z.lazy(() => UserSubscriptionUncheckedUpdateManyWithoutUserInputSchema) ]),
}).strict();

export const UserSubscriptionScalarWhereInputSchema: z.ZodType<Prisma.UserSubscriptionScalarWhereInput> = z.object({
  AND: z.union([ z.lazy(() => UserSubscriptionScalarWhereInputSchema),z.lazy(() => UserSubscriptionScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => UserSubscriptionScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UserSubscriptionScalarWhereInputSchema),z.lazy(() => UserSubscriptionScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  planId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  status: z.union([ z.lazy(() => EnumSubscriptionStatusFilterSchema),z.lazy(() => SubscriptionStatusSchema) ]).optional(),
  startDate: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  endDate: z.union([ z.lazy(() => DateTimeNullableFilterSchema),z.coerce.date() ]).optional().nullable(),
  cancelledAt: z.union([ z.lazy(() => DateTimeNullableFilterSchema),z.coerce.date() ]).optional().nullable(),
  paymentId: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  paymentMethod: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  amount: z.union([ z.lazy(() => DecimalFilterSchema),z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional(),
  autoRenew: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  nextBillingDate: z.union([ z.lazy(() => DateTimeNullableFilterSchema),z.coerce.date() ]).optional().nullable(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
}).strict();

export const BlogPostUpsertWithWhereUniqueWithoutAuthorInputSchema: z.ZodType<Prisma.BlogPostUpsertWithWhereUniqueWithoutAuthorInput> = z.object({
  where: z.lazy(() => BlogPostWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => BlogPostUpdateWithoutAuthorInputSchema),z.lazy(() => BlogPostUncheckedUpdateWithoutAuthorInputSchema) ]),
  create: z.union([ z.lazy(() => BlogPostCreateWithoutAuthorInputSchema),z.lazy(() => BlogPostUncheckedCreateWithoutAuthorInputSchema) ]),
}).strict();

export const BlogPostUpdateWithWhereUniqueWithoutAuthorInputSchema: z.ZodType<Prisma.BlogPostUpdateWithWhereUniqueWithoutAuthorInput> = z.object({
  where: z.lazy(() => BlogPostWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => BlogPostUpdateWithoutAuthorInputSchema),z.lazy(() => BlogPostUncheckedUpdateWithoutAuthorInputSchema) ]),
}).strict();

export const BlogPostUpdateManyWithWhereWithoutAuthorInputSchema: z.ZodType<Prisma.BlogPostUpdateManyWithWhereWithoutAuthorInput> = z.object({
  where: z.lazy(() => BlogPostScalarWhereInputSchema),
  data: z.union([ z.lazy(() => BlogPostUpdateManyMutationInputSchema),z.lazy(() => BlogPostUncheckedUpdateManyWithoutAuthorInputSchema) ]),
}).strict();

export const BlogPostScalarWhereInputSchema: z.ZodType<Prisma.BlogPostScalarWhereInput> = z.object({
  AND: z.union([ z.lazy(() => BlogPostScalarWhereInputSchema),z.lazy(() => BlogPostScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => BlogPostScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => BlogPostScalarWhereInputSchema),z.lazy(() => BlogPostScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  slug: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  title: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  excerpt: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  content: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  image: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  authorId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  accessLevel: z.union([ z.lazy(() => EnumAccessLevelFilterSchema),z.lazy(() => AccessLevelSchema) ]).optional(),
  previewContent: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  tags: z.lazy(() => StringNullableListFilterSchema).optional(),
  published: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  publishedAt: z.union([ z.lazy(() => DateTimeNullableFilterSchema),z.coerce.date() ]).optional().nullable(),
  viewCount: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
}).strict();

export const UserCreateWithoutSessionsInputSchema: z.ZodType<Prisma.UserCreateWithoutSessionsInput> = z.object({
  id: z.string().cuid().optional(),
  name: z.string(),
  email: z.string(),
  emailVerified: z.boolean(),
  image: z.string().optional().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  username: z.string().optional().nullable(),
  role: z.string().optional().nullable(),
  banned: z.boolean().optional().nullable(),
  banReason: z.string().optional().nullable(),
  banExpires: z.coerce.date().optional().nullable(),
  onboardingComplete: z.boolean().optional(),
  paymentsCustomerId: z.string().optional().nullable(),
  locale: z.string().optional().nullable(),
  membershipLevel: z.lazy(() => MembershipLevelSchema).optional(),
  accounts: z.lazy(() => AccountCreateNestedManyWithoutUserInputSchema).optional(),
  passkeys: z.lazy(() => PasskeyCreateNestedManyWithoutUserInputSchema).optional(),
  invitations: z.lazy(() => InvitationCreateNestedManyWithoutUserInputSchema).optional(),
  purchases: z.lazy(() => PurchaseCreateNestedManyWithoutUserInputSchema).optional(),
  memberships: z.lazy(() => MemberCreateNestedManyWithoutUserInputSchema).optional(),
  aiChats: z.lazy(() => AiChatCreateNestedManyWithoutUserInputSchema).optional(),
  subscriptions: z.lazy(() => UserSubscriptionCreateNestedManyWithoutUserInputSchema).optional(),
  blogPosts: z.lazy(() => BlogPostCreateNestedManyWithoutAuthorInputSchema).optional()
}).strict();

export const UserUncheckedCreateWithoutSessionsInputSchema: z.ZodType<Prisma.UserUncheckedCreateWithoutSessionsInput> = z.object({
  id: z.string().cuid().optional(),
  name: z.string(),
  email: z.string(),
  emailVerified: z.boolean(),
  image: z.string().optional().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  username: z.string().optional().nullable(),
  role: z.string().optional().nullable(),
  banned: z.boolean().optional().nullable(),
  banReason: z.string().optional().nullable(),
  banExpires: z.coerce.date().optional().nullable(),
  onboardingComplete: z.boolean().optional(),
  paymentsCustomerId: z.string().optional().nullable(),
  locale: z.string().optional().nullable(),
  membershipLevel: z.lazy(() => MembershipLevelSchema).optional(),
  accounts: z.lazy(() => AccountUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  passkeys: z.lazy(() => PasskeyUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  invitations: z.lazy(() => InvitationUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  purchases: z.lazy(() => PurchaseUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  memberships: z.lazy(() => MemberUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  aiChats: z.lazy(() => AiChatUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  subscriptions: z.lazy(() => UserSubscriptionUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  blogPosts: z.lazy(() => BlogPostUncheckedCreateNestedManyWithoutAuthorInputSchema).optional()
}).strict();

export const UserCreateOrConnectWithoutSessionsInputSchema: z.ZodType<Prisma.UserCreateOrConnectWithoutSessionsInput> = z.object({
  where: z.lazy(() => UserWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserCreateWithoutSessionsInputSchema),z.lazy(() => UserUncheckedCreateWithoutSessionsInputSchema) ]),
}).strict();

export const UserUpsertWithoutSessionsInputSchema: z.ZodType<Prisma.UserUpsertWithoutSessionsInput> = z.object({
  update: z.union([ z.lazy(() => UserUpdateWithoutSessionsInputSchema),z.lazy(() => UserUncheckedUpdateWithoutSessionsInputSchema) ]),
  create: z.union([ z.lazy(() => UserCreateWithoutSessionsInputSchema),z.lazy(() => UserUncheckedCreateWithoutSessionsInputSchema) ]),
  where: z.lazy(() => UserWhereInputSchema).optional()
}).strict();

export const UserUpdateToOneWithWhereWithoutSessionsInputSchema: z.ZodType<Prisma.UserUpdateToOneWithWhereWithoutSessionsInput> = z.object({
  where: z.lazy(() => UserWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => UserUpdateWithoutSessionsInputSchema),z.lazy(() => UserUncheckedUpdateWithoutSessionsInputSchema) ]),
}).strict();

export const UserUpdateWithoutSessionsInputSchema: z.ZodType<Prisma.UserUpdateWithoutSessionsInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  emailVerified: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  image: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  username: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  role: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  banned: z.union([ z.boolean(),z.lazy(() => NullableBoolFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  banReason: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  banExpires: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  onboardingComplete: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  paymentsCustomerId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  locale: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  membershipLevel: z.union([ z.lazy(() => MembershipLevelSchema),z.lazy(() => EnumMembershipLevelFieldUpdateOperationsInputSchema) ]).optional(),
  accounts: z.lazy(() => AccountUpdateManyWithoutUserNestedInputSchema).optional(),
  passkeys: z.lazy(() => PasskeyUpdateManyWithoutUserNestedInputSchema).optional(),
  invitations: z.lazy(() => InvitationUpdateManyWithoutUserNestedInputSchema).optional(),
  purchases: z.lazy(() => PurchaseUpdateManyWithoutUserNestedInputSchema).optional(),
  memberships: z.lazy(() => MemberUpdateManyWithoutUserNestedInputSchema).optional(),
  aiChats: z.lazy(() => AiChatUpdateManyWithoutUserNestedInputSchema).optional(),
  subscriptions: z.lazy(() => UserSubscriptionUpdateManyWithoutUserNestedInputSchema).optional(),
  blogPosts: z.lazy(() => BlogPostUpdateManyWithoutAuthorNestedInputSchema).optional()
}).strict();

export const UserUncheckedUpdateWithoutSessionsInputSchema: z.ZodType<Prisma.UserUncheckedUpdateWithoutSessionsInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  emailVerified: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  image: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  username: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  role: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  banned: z.union([ z.boolean(),z.lazy(() => NullableBoolFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  banReason: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  banExpires: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  onboardingComplete: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  paymentsCustomerId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  locale: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  membershipLevel: z.union([ z.lazy(() => MembershipLevelSchema),z.lazy(() => EnumMembershipLevelFieldUpdateOperationsInputSchema) ]).optional(),
  accounts: z.lazy(() => AccountUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  passkeys: z.lazy(() => PasskeyUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  invitations: z.lazy(() => InvitationUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  purchases: z.lazy(() => PurchaseUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  memberships: z.lazy(() => MemberUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  aiChats: z.lazy(() => AiChatUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  subscriptions: z.lazy(() => UserSubscriptionUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  blogPosts: z.lazy(() => BlogPostUncheckedUpdateManyWithoutAuthorNestedInputSchema).optional()
}).strict();

export const UserCreateWithoutAccountsInputSchema: z.ZodType<Prisma.UserCreateWithoutAccountsInput> = z.object({
  id: z.string().cuid().optional(),
  name: z.string(),
  email: z.string(),
  emailVerified: z.boolean(),
  image: z.string().optional().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  username: z.string().optional().nullable(),
  role: z.string().optional().nullable(),
  banned: z.boolean().optional().nullable(),
  banReason: z.string().optional().nullable(),
  banExpires: z.coerce.date().optional().nullable(),
  onboardingComplete: z.boolean().optional(),
  paymentsCustomerId: z.string().optional().nullable(),
  locale: z.string().optional().nullable(),
  membershipLevel: z.lazy(() => MembershipLevelSchema).optional(),
  sessions: z.lazy(() => SessionCreateNestedManyWithoutUserInputSchema).optional(),
  passkeys: z.lazy(() => PasskeyCreateNestedManyWithoutUserInputSchema).optional(),
  invitations: z.lazy(() => InvitationCreateNestedManyWithoutUserInputSchema).optional(),
  purchases: z.lazy(() => PurchaseCreateNestedManyWithoutUserInputSchema).optional(),
  memberships: z.lazy(() => MemberCreateNestedManyWithoutUserInputSchema).optional(),
  aiChats: z.lazy(() => AiChatCreateNestedManyWithoutUserInputSchema).optional(),
  subscriptions: z.lazy(() => UserSubscriptionCreateNestedManyWithoutUserInputSchema).optional(),
  blogPosts: z.lazy(() => BlogPostCreateNestedManyWithoutAuthorInputSchema).optional()
}).strict();

export const UserUncheckedCreateWithoutAccountsInputSchema: z.ZodType<Prisma.UserUncheckedCreateWithoutAccountsInput> = z.object({
  id: z.string().cuid().optional(),
  name: z.string(),
  email: z.string(),
  emailVerified: z.boolean(),
  image: z.string().optional().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  username: z.string().optional().nullable(),
  role: z.string().optional().nullable(),
  banned: z.boolean().optional().nullable(),
  banReason: z.string().optional().nullable(),
  banExpires: z.coerce.date().optional().nullable(),
  onboardingComplete: z.boolean().optional(),
  paymentsCustomerId: z.string().optional().nullable(),
  locale: z.string().optional().nullable(),
  membershipLevel: z.lazy(() => MembershipLevelSchema).optional(),
  sessions: z.lazy(() => SessionUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  passkeys: z.lazy(() => PasskeyUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  invitations: z.lazy(() => InvitationUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  purchases: z.lazy(() => PurchaseUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  memberships: z.lazy(() => MemberUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  aiChats: z.lazy(() => AiChatUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  subscriptions: z.lazy(() => UserSubscriptionUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  blogPosts: z.lazy(() => BlogPostUncheckedCreateNestedManyWithoutAuthorInputSchema).optional()
}).strict();

export const UserCreateOrConnectWithoutAccountsInputSchema: z.ZodType<Prisma.UserCreateOrConnectWithoutAccountsInput> = z.object({
  where: z.lazy(() => UserWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserCreateWithoutAccountsInputSchema),z.lazy(() => UserUncheckedCreateWithoutAccountsInputSchema) ]),
}).strict();

export const UserUpsertWithoutAccountsInputSchema: z.ZodType<Prisma.UserUpsertWithoutAccountsInput> = z.object({
  update: z.union([ z.lazy(() => UserUpdateWithoutAccountsInputSchema),z.lazy(() => UserUncheckedUpdateWithoutAccountsInputSchema) ]),
  create: z.union([ z.lazy(() => UserCreateWithoutAccountsInputSchema),z.lazy(() => UserUncheckedCreateWithoutAccountsInputSchema) ]),
  where: z.lazy(() => UserWhereInputSchema).optional()
}).strict();

export const UserUpdateToOneWithWhereWithoutAccountsInputSchema: z.ZodType<Prisma.UserUpdateToOneWithWhereWithoutAccountsInput> = z.object({
  where: z.lazy(() => UserWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => UserUpdateWithoutAccountsInputSchema),z.lazy(() => UserUncheckedUpdateWithoutAccountsInputSchema) ]),
}).strict();

export const UserUpdateWithoutAccountsInputSchema: z.ZodType<Prisma.UserUpdateWithoutAccountsInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  emailVerified: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  image: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  username: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  role: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  banned: z.union([ z.boolean(),z.lazy(() => NullableBoolFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  banReason: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  banExpires: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  onboardingComplete: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  paymentsCustomerId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  locale: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  membershipLevel: z.union([ z.lazy(() => MembershipLevelSchema),z.lazy(() => EnumMembershipLevelFieldUpdateOperationsInputSchema) ]).optional(),
  sessions: z.lazy(() => SessionUpdateManyWithoutUserNestedInputSchema).optional(),
  passkeys: z.lazy(() => PasskeyUpdateManyWithoutUserNestedInputSchema).optional(),
  invitations: z.lazy(() => InvitationUpdateManyWithoutUserNestedInputSchema).optional(),
  purchases: z.lazy(() => PurchaseUpdateManyWithoutUserNestedInputSchema).optional(),
  memberships: z.lazy(() => MemberUpdateManyWithoutUserNestedInputSchema).optional(),
  aiChats: z.lazy(() => AiChatUpdateManyWithoutUserNestedInputSchema).optional(),
  subscriptions: z.lazy(() => UserSubscriptionUpdateManyWithoutUserNestedInputSchema).optional(),
  blogPosts: z.lazy(() => BlogPostUpdateManyWithoutAuthorNestedInputSchema).optional()
}).strict();

export const UserUncheckedUpdateWithoutAccountsInputSchema: z.ZodType<Prisma.UserUncheckedUpdateWithoutAccountsInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  emailVerified: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  image: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  username: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  role: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  banned: z.union([ z.boolean(),z.lazy(() => NullableBoolFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  banReason: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  banExpires: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  onboardingComplete: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  paymentsCustomerId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  locale: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  membershipLevel: z.union([ z.lazy(() => MembershipLevelSchema),z.lazy(() => EnumMembershipLevelFieldUpdateOperationsInputSchema) ]).optional(),
  sessions: z.lazy(() => SessionUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  passkeys: z.lazy(() => PasskeyUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  invitations: z.lazy(() => InvitationUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  purchases: z.lazy(() => PurchaseUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  memberships: z.lazy(() => MemberUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  aiChats: z.lazy(() => AiChatUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  subscriptions: z.lazy(() => UserSubscriptionUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  blogPosts: z.lazy(() => BlogPostUncheckedUpdateManyWithoutAuthorNestedInputSchema).optional()
}).strict();

export const UserCreateWithoutPasskeysInputSchema: z.ZodType<Prisma.UserCreateWithoutPasskeysInput> = z.object({
  id: z.string().cuid().optional(),
  name: z.string(),
  email: z.string(),
  emailVerified: z.boolean(),
  image: z.string().optional().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  username: z.string().optional().nullable(),
  role: z.string().optional().nullable(),
  banned: z.boolean().optional().nullable(),
  banReason: z.string().optional().nullable(),
  banExpires: z.coerce.date().optional().nullable(),
  onboardingComplete: z.boolean().optional(),
  paymentsCustomerId: z.string().optional().nullable(),
  locale: z.string().optional().nullable(),
  membershipLevel: z.lazy(() => MembershipLevelSchema).optional(),
  sessions: z.lazy(() => SessionCreateNestedManyWithoutUserInputSchema).optional(),
  accounts: z.lazy(() => AccountCreateNestedManyWithoutUserInputSchema).optional(),
  invitations: z.lazy(() => InvitationCreateNestedManyWithoutUserInputSchema).optional(),
  purchases: z.lazy(() => PurchaseCreateNestedManyWithoutUserInputSchema).optional(),
  memberships: z.lazy(() => MemberCreateNestedManyWithoutUserInputSchema).optional(),
  aiChats: z.lazy(() => AiChatCreateNestedManyWithoutUserInputSchema).optional(),
  subscriptions: z.lazy(() => UserSubscriptionCreateNestedManyWithoutUserInputSchema).optional(),
  blogPosts: z.lazy(() => BlogPostCreateNestedManyWithoutAuthorInputSchema).optional()
}).strict();

export const UserUncheckedCreateWithoutPasskeysInputSchema: z.ZodType<Prisma.UserUncheckedCreateWithoutPasskeysInput> = z.object({
  id: z.string().cuid().optional(),
  name: z.string(),
  email: z.string(),
  emailVerified: z.boolean(),
  image: z.string().optional().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  username: z.string().optional().nullable(),
  role: z.string().optional().nullable(),
  banned: z.boolean().optional().nullable(),
  banReason: z.string().optional().nullable(),
  banExpires: z.coerce.date().optional().nullable(),
  onboardingComplete: z.boolean().optional(),
  paymentsCustomerId: z.string().optional().nullable(),
  locale: z.string().optional().nullable(),
  membershipLevel: z.lazy(() => MembershipLevelSchema).optional(),
  sessions: z.lazy(() => SessionUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  accounts: z.lazy(() => AccountUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  invitations: z.lazy(() => InvitationUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  purchases: z.lazy(() => PurchaseUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  memberships: z.lazy(() => MemberUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  aiChats: z.lazy(() => AiChatUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  subscriptions: z.lazy(() => UserSubscriptionUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  blogPosts: z.lazy(() => BlogPostUncheckedCreateNestedManyWithoutAuthorInputSchema).optional()
}).strict();

export const UserCreateOrConnectWithoutPasskeysInputSchema: z.ZodType<Prisma.UserCreateOrConnectWithoutPasskeysInput> = z.object({
  where: z.lazy(() => UserWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserCreateWithoutPasskeysInputSchema),z.lazy(() => UserUncheckedCreateWithoutPasskeysInputSchema) ]),
}).strict();

export const UserUpsertWithoutPasskeysInputSchema: z.ZodType<Prisma.UserUpsertWithoutPasskeysInput> = z.object({
  update: z.union([ z.lazy(() => UserUpdateWithoutPasskeysInputSchema),z.lazy(() => UserUncheckedUpdateWithoutPasskeysInputSchema) ]),
  create: z.union([ z.lazy(() => UserCreateWithoutPasskeysInputSchema),z.lazy(() => UserUncheckedCreateWithoutPasskeysInputSchema) ]),
  where: z.lazy(() => UserWhereInputSchema).optional()
}).strict();

export const UserUpdateToOneWithWhereWithoutPasskeysInputSchema: z.ZodType<Prisma.UserUpdateToOneWithWhereWithoutPasskeysInput> = z.object({
  where: z.lazy(() => UserWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => UserUpdateWithoutPasskeysInputSchema),z.lazy(() => UserUncheckedUpdateWithoutPasskeysInputSchema) ]),
}).strict();

export const UserUpdateWithoutPasskeysInputSchema: z.ZodType<Prisma.UserUpdateWithoutPasskeysInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  emailVerified: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  image: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  username: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  role: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  banned: z.union([ z.boolean(),z.lazy(() => NullableBoolFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  banReason: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  banExpires: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  onboardingComplete: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  paymentsCustomerId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  locale: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  membershipLevel: z.union([ z.lazy(() => MembershipLevelSchema),z.lazy(() => EnumMembershipLevelFieldUpdateOperationsInputSchema) ]).optional(),
  sessions: z.lazy(() => SessionUpdateManyWithoutUserNestedInputSchema).optional(),
  accounts: z.lazy(() => AccountUpdateManyWithoutUserNestedInputSchema).optional(),
  invitations: z.lazy(() => InvitationUpdateManyWithoutUserNestedInputSchema).optional(),
  purchases: z.lazy(() => PurchaseUpdateManyWithoutUserNestedInputSchema).optional(),
  memberships: z.lazy(() => MemberUpdateManyWithoutUserNestedInputSchema).optional(),
  aiChats: z.lazy(() => AiChatUpdateManyWithoutUserNestedInputSchema).optional(),
  subscriptions: z.lazy(() => UserSubscriptionUpdateManyWithoutUserNestedInputSchema).optional(),
  blogPosts: z.lazy(() => BlogPostUpdateManyWithoutAuthorNestedInputSchema).optional()
}).strict();

export const UserUncheckedUpdateWithoutPasskeysInputSchema: z.ZodType<Prisma.UserUncheckedUpdateWithoutPasskeysInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  emailVerified: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  image: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  username: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  role: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  banned: z.union([ z.boolean(),z.lazy(() => NullableBoolFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  banReason: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  banExpires: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  onboardingComplete: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  paymentsCustomerId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  locale: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  membershipLevel: z.union([ z.lazy(() => MembershipLevelSchema),z.lazy(() => EnumMembershipLevelFieldUpdateOperationsInputSchema) ]).optional(),
  sessions: z.lazy(() => SessionUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  accounts: z.lazy(() => AccountUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  invitations: z.lazy(() => InvitationUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  purchases: z.lazy(() => PurchaseUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  memberships: z.lazy(() => MemberUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  aiChats: z.lazy(() => AiChatUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  subscriptions: z.lazy(() => UserSubscriptionUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  blogPosts: z.lazy(() => BlogPostUncheckedUpdateManyWithoutAuthorNestedInputSchema).optional()
}).strict();

export const MemberCreateWithoutOrganizationInputSchema: z.ZodType<Prisma.MemberCreateWithoutOrganizationInput> = z.object({
  id: z.string().cuid().optional(),
  role: z.string(),
  createdAt: z.coerce.date(),
  user: z.lazy(() => UserCreateNestedOneWithoutMembershipsInputSchema)
}).strict();

export const MemberUncheckedCreateWithoutOrganizationInputSchema: z.ZodType<Prisma.MemberUncheckedCreateWithoutOrganizationInput> = z.object({
  id: z.string().cuid().optional(),
  userId: z.string(),
  role: z.string(),
  createdAt: z.coerce.date()
}).strict();

export const MemberCreateOrConnectWithoutOrganizationInputSchema: z.ZodType<Prisma.MemberCreateOrConnectWithoutOrganizationInput> = z.object({
  where: z.lazy(() => MemberWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => MemberCreateWithoutOrganizationInputSchema),z.lazy(() => MemberUncheckedCreateWithoutOrganizationInputSchema) ]),
}).strict();

export const MemberCreateManyOrganizationInputEnvelopeSchema: z.ZodType<Prisma.MemberCreateManyOrganizationInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => MemberCreateManyOrganizationInputSchema),z.lazy(() => MemberCreateManyOrganizationInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export const InvitationCreateWithoutOrganizationInputSchema: z.ZodType<Prisma.InvitationCreateWithoutOrganizationInput> = z.object({
  id: z.string().cuid().optional(),
  email: z.string(),
  role: z.string().optional().nullable(),
  status: z.string(),
  expiresAt: z.coerce.date(),
  user: z.lazy(() => UserCreateNestedOneWithoutInvitationsInputSchema)
}).strict();

export const InvitationUncheckedCreateWithoutOrganizationInputSchema: z.ZodType<Prisma.InvitationUncheckedCreateWithoutOrganizationInput> = z.object({
  id: z.string().cuid().optional(),
  email: z.string(),
  role: z.string().optional().nullable(),
  status: z.string(),
  expiresAt: z.coerce.date(),
  inviterId: z.string()
}).strict();

export const InvitationCreateOrConnectWithoutOrganizationInputSchema: z.ZodType<Prisma.InvitationCreateOrConnectWithoutOrganizationInput> = z.object({
  where: z.lazy(() => InvitationWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => InvitationCreateWithoutOrganizationInputSchema),z.lazy(() => InvitationUncheckedCreateWithoutOrganizationInputSchema) ]),
}).strict();

export const InvitationCreateManyOrganizationInputEnvelopeSchema: z.ZodType<Prisma.InvitationCreateManyOrganizationInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => InvitationCreateManyOrganizationInputSchema),z.lazy(() => InvitationCreateManyOrganizationInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export const PurchaseCreateWithoutOrganizationInputSchema: z.ZodType<Prisma.PurchaseCreateWithoutOrganizationInput> = z.object({
  id: z.string().cuid().optional(),
  type: z.lazy(() => PurchaseTypeSchema),
  customerId: z.string(),
  subscriptionId: z.string().optional().nullable(),
  productId: z.string(),
  status: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  user: z.lazy(() => UserCreateNestedOneWithoutPurchasesInputSchema).optional()
}).strict();

export const PurchaseUncheckedCreateWithoutOrganizationInputSchema: z.ZodType<Prisma.PurchaseUncheckedCreateWithoutOrganizationInput> = z.object({
  id: z.string().cuid().optional(),
  userId: z.string().optional().nullable(),
  type: z.lazy(() => PurchaseTypeSchema),
  customerId: z.string(),
  subscriptionId: z.string().optional().nullable(),
  productId: z.string(),
  status: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional()
}).strict();

export const PurchaseCreateOrConnectWithoutOrganizationInputSchema: z.ZodType<Prisma.PurchaseCreateOrConnectWithoutOrganizationInput> = z.object({
  where: z.lazy(() => PurchaseWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => PurchaseCreateWithoutOrganizationInputSchema),z.lazy(() => PurchaseUncheckedCreateWithoutOrganizationInputSchema) ]),
}).strict();

export const PurchaseCreateManyOrganizationInputEnvelopeSchema: z.ZodType<Prisma.PurchaseCreateManyOrganizationInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => PurchaseCreateManyOrganizationInputSchema),z.lazy(() => PurchaseCreateManyOrganizationInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export const AiChatCreateWithoutOrganizationInputSchema: z.ZodType<Prisma.AiChatCreateWithoutOrganizationInput> = z.object({
  id: z.string().cuid().optional(),
  title: z.string().optional().nullable(),
  messages: z.union([ z.lazy(() => JsonNullValueInputSchema),z.array(z.object({ role: z.enum(['user', 'assistant']), content: z.string() })) ]).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  user: z.lazy(() => UserCreateNestedOneWithoutAiChatsInputSchema).optional()
}).strict();

export const AiChatUncheckedCreateWithoutOrganizationInputSchema: z.ZodType<Prisma.AiChatUncheckedCreateWithoutOrganizationInput> = z.object({
  id: z.string().cuid().optional(),
  userId: z.string().optional().nullable(),
  title: z.string().optional().nullable(),
  messages: z.union([ z.lazy(() => JsonNullValueInputSchema),z.array(z.object({ role: z.enum(['user', 'assistant']), content: z.string() })) ]).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional()
}).strict();

export const AiChatCreateOrConnectWithoutOrganizationInputSchema: z.ZodType<Prisma.AiChatCreateOrConnectWithoutOrganizationInput> = z.object({
  where: z.lazy(() => AiChatWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => AiChatCreateWithoutOrganizationInputSchema),z.lazy(() => AiChatUncheckedCreateWithoutOrganizationInputSchema) ]),
}).strict();

export const AiChatCreateManyOrganizationInputEnvelopeSchema: z.ZodType<Prisma.AiChatCreateManyOrganizationInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => AiChatCreateManyOrganizationInputSchema),z.lazy(() => AiChatCreateManyOrganizationInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export const MemberUpsertWithWhereUniqueWithoutOrganizationInputSchema: z.ZodType<Prisma.MemberUpsertWithWhereUniqueWithoutOrganizationInput> = z.object({
  where: z.lazy(() => MemberWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => MemberUpdateWithoutOrganizationInputSchema),z.lazy(() => MemberUncheckedUpdateWithoutOrganizationInputSchema) ]),
  create: z.union([ z.lazy(() => MemberCreateWithoutOrganizationInputSchema),z.lazy(() => MemberUncheckedCreateWithoutOrganizationInputSchema) ]),
}).strict();

export const MemberUpdateWithWhereUniqueWithoutOrganizationInputSchema: z.ZodType<Prisma.MemberUpdateWithWhereUniqueWithoutOrganizationInput> = z.object({
  where: z.lazy(() => MemberWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => MemberUpdateWithoutOrganizationInputSchema),z.lazy(() => MemberUncheckedUpdateWithoutOrganizationInputSchema) ]),
}).strict();

export const MemberUpdateManyWithWhereWithoutOrganizationInputSchema: z.ZodType<Prisma.MemberUpdateManyWithWhereWithoutOrganizationInput> = z.object({
  where: z.lazy(() => MemberScalarWhereInputSchema),
  data: z.union([ z.lazy(() => MemberUpdateManyMutationInputSchema),z.lazy(() => MemberUncheckedUpdateManyWithoutOrganizationInputSchema) ]),
}).strict();

export const InvitationUpsertWithWhereUniqueWithoutOrganizationInputSchema: z.ZodType<Prisma.InvitationUpsertWithWhereUniqueWithoutOrganizationInput> = z.object({
  where: z.lazy(() => InvitationWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => InvitationUpdateWithoutOrganizationInputSchema),z.lazy(() => InvitationUncheckedUpdateWithoutOrganizationInputSchema) ]),
  create: z.union([ z.lazy(() => InvitationCreateWithoutOrganizationInputSchema),z.lazy(() => InvitationUncheckedCreateWithoutOrganizationInputSchema) ]),
}).strict();

export const InvitationUpdateWithWhereUniqueWithoutOrganizationInputSchema: z.ZodType<Prisma.InvitationUpdateWithWhereUniqueWithoutOrganizationInput> = z.object({
  where: z.lazy(() => InvitationWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => InvitationUpdateWithoutOrganizationInputSchema),z.lazy(() => InvitationUncheckedUpdateWithoutOrganizationInputSchema) ]),
}).strict();

export const InvitationUpdateManyWithWhereWithoutOrganizationInputSchema: z.ZodType<Prisma.InvitationUpdateManyWithWhereWithoutOrganizationInput> = z.object({
  where: z.lazy(() => InvitationScalarWhereInputSchema),
  data: z.union([ z.lazy(() => InvitationUpdateManyMutationInputSchema),z.lazy(() => InvitationUncheckedUpdateManyWithoutOrganizationInputSchema) ]),
}).strict();

export const PurchaseUpsertWithWhereUniqueWithoutOrganizationInputSchema: z.ZodType<Prisma.PurchaseUpsertWithWhereUniqueWithoutOrganizationInput> = z.object({
  where: z.lazy(() => PurchaseWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => PurchaseUpdateWithoutOrganizationInputSchema),z.lazy(() => PurchaseUncheckedUpdateWithoutOrganizationInputSchema) ]),
  create: z.union([ z.lazy(() => PurchaseCreateWithoutOrganizationInputSchema),z.lazy(() => PurchaseUncheckedCreateWithoutOrganizationInputSchema) ]),
}).strict();

export const PurchaseUpdateWithWhereUniqueWithoutOrganizationInputSchema: z.ZodType<Prisma.PurchaseUpdateWithWhereUniqueWithoutOrganizationInput> = z.object({
  where: z.lazy(() => PurchaseWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => PurchaseUpdateWithoutOrganizationInputSchema),z.lazy(() => PurchaseUncheckedUpdateWithoutOrganizationInputSchema) ]),
}).strict();

export const PurchaseUpdateManyWithWhereWithoutOrganizationInputSchema: z.ZodType<Prisma.PurchaseUpdateManyWithWhereWithoutOrganizationInput> = z.object({
  where: z.lazy(() => PurchaseScalarWhereInputSchema),
  data: z.union([ z.lazy(() => PurchaseUpdateManyMutationInputSchema),z.lazy(() => PurchaseUncheckedUpdateManyWithoutOrganizationInputSchema) ]),
}).strict();

export const AiChatUpsertWithWhereUniqueWithoutOrganizationInputSchema: z.ZodType<Prisma.AiChatUpsertWithWhereUniqueWithoutOrganizationInput> = z.object({
  where: z.lazy(() => AiChatWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => AiChatUpdateWithoutOrganizationInputSchema),z.lazy(() => AiChatUncheckedUpdateWithoutOrganizationInputSchema) ]),
  create: z.union([ z.lazy(() => AiChatCreateWithoutOrganizationInputSchema),z.lazy(() => AiChatUncheckedCreateWithoutOrganizationInputSchema) ]),
}).strict();

export const AiChatUpdateWithWhereUniqueWithoutOrganizationInputSchema: z.ZodType<Prisma.AiChatUpdateWithWhereUniqueWithoutOrganizationInput> = z.object({
  where: z.lazy(() => AiChatWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => AiChatUpdateWithoutOrganizationInputSchema),z.lazy(() => AiChatUncheckedUpdateWithoutOrganizationInputSchema) ]),
}).strict();

export const AiChatUpdateManyWithWhereWithoutOrganizationInputSchema: z.ZodType<Prisma.AiChatUpdateManyWithWhereWithoutOrganizationInput> = z.object({
  where: z.lazy(() => AiChatScalarWhereInputSchema),
  data: z.union([ z.lazy(() => AiChatUpdateManyMutationInputSchema),z.lazy(() => AiChatUncheckedUpdateManyWithoutOrganizationInputSchema) ]),
}).strict();

export const OrganizationCreateWithoutMembersInputSchema: z.ZodType<Prisma.OrganizationCreateWithoutMembersInput> = z.object({
  id: z.string().cuid().optional(),
  name: z.string(),
  slug: z.string().optional().nullable(),
  logo: z.string().optional().nullable(),
  createdAt: z.coerce.date(),
  metadata: z.string().optional().nullable(),
  paymentsCustomerId: z.string().optional().nullable(),
  invitations: z.lazy(() => InvitationCreateNestedManyWithoutOrganizationInputSchema).optional(),
  purchases: z.lazy(() => PurchaseCreateNestedManyWithoutOrganizationInputSchema).optional(),
  aiChats: z.lazy(() => AiChatCreateNestedManyWithoutOrganizationInputSchema).optional()
}).strict();

export const OrganizationUncheckedCreateWithoutMembersInputSchema: z.ZodType<Prisma.OrganizationUncheckedCreateWithoutMembersInput> = z.object({
  id: z.string().cuid().optional(),
  name: z.string(),
  slug: z.string().optional().nullable(),
  logo: z.string().optional().nullable(),
  createdAt: z.coerce.date(),
  metadata: z.string().optional().nullable(),
  paymentsCustomerId: z.string().optional().nullable(),
  invitations: z.lazy(() => InvitationUncheckedCreateNestedManyWithoutOrganizationInputSchema).optional(),
  purchases: z.lazy(() => PurchaseUncheckedCreateNestedManyWithoutOrganizationInputSchema).optional(),
  aiChats: z.lazy(() => AiChatUncheckedCreateNestedManyWithoutOrganizationInputSchema).optional()
}).strict();

export const OrganizationCreateOrConnectWithoutMembersInputSchema: z.ZodType<Prisma.OrganizationCreateOrConnectWithoutMembersInput> = z.object({
  where: z.lazy(() => OrganizationWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => OrganizationCreateWithoutMembersInputSchema),z.lazy(() => OrganizationUncheckedCreateWithoutMembersInputSchema) ]),
}).strict();

export const UserCreateWithoutMembershipsInputSchema: z.ZodType<Prisma.UserCreateWithoutMembershipsInput> = z.object({
  id: z.string().cuid().optional(),
  name: z.string(),
  email: z.string(),
  emailVerified: z.boolean(),
  image: z.string().optional().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  username: z.string().optional().nullable(),
  role: z.string().optional().nullable(),
  banned: z.boolean().optional().nullable(),
  banReason: z.string().optional().nullable(),
  banExpires: z.coerce.date().optional().nullable(),
  onboardingComplete: z.boolean().optional(),
  paymentsCustomerId: z.string().optional().nullable(),
  locale: z.string().optional().nullable(),
  membershipLevel: z.lazy(() => MembershipLevelSchema).optional(),
  sessions: z.lazy(() => SessionCreateNestedManyWithoutUserInputSchema).optional(),
  accounts: z.lazy(() => AccountCreateNestedManyWithoutUserInputSchema).optional(),
  passkeys: z.lazy(() => PasskeyCreateNestedManyWithoutUserInputSchema).optional(),
  invitations: z.lazy(() => InvitationCreateNestedManyWithoutUserInputSchema).optional(),
  purchases: z.lazy(() => PurchaseCreateNestedManyWithoutUserInputSchema).optional(),
  aiChats: z.lazy(() => AiChatCreateNestedManyWithoutUserInputSchema).optional(),
  subscriptions: z.lazy(() => UserSubscriptionCreateNestedManyWithoutUserInputSchema).optional(),
  blogPosts: z.lazy(() => BlogPostCreateNestedManyWithoutAuthorInputSchema).optional()
}).strict();

export const UserUncheckedCreateWithoutMembershipsInputSchema: z.ZodType<Prisma.UserUncheckedCreateWithoutMembershipsInput> = z.object({
  id: z.string().cuid().optional(),
  name: z.string(),
  email: z.string(),
  emailVerified: z.boolean(),
  image: z.string().optional().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  username: z.string().optional().nullable(),
  role: z.string().optional().nullable(),
  banned: z.boolean().optional().nullable(),
  banReason: z.string().optional().nullable(),
  banExpires: z.coerce.date().optional().nullable(),
  onboardingComplete: z.boolean().optional(),
  paymentsCustomerId: z.string().optional().nullable(),
  locale: z.string().optional().nullable(),
  membershipLevel: z.lazy(() => MembershipLevelSchema).optional(),
  sessions: z.lazy(() => SessionUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  accounts: z.lazy(() => AccountUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  passkeys: z.lazy(() => PasskeyUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  invitations: z.lazy(() => InvitationUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  purchases: z.lazy(() => PurchaseUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  aiChats: z.lazy(() => AiChatUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  subscriptions: z.lazy(() => UserSubscriptionUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  blogPosts: z.lazy(() => BlogPostUncheckedCreateNestedManyWithoutAuthorInputSchema).optional()
}).strict();

export const UserCreateOrConnectWithoutMembershipsInputSchema: z.ZodType<Prisma.UserCreateOrConnectWithoutMembershipsInput> = z.object({
  where: z.lazy(() => UserWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserCreateWithoutMembershipsInputSchema),z.lazy(() => UserUncheckedCreateWithoutMembershipsInputSchema) ]),
}).strict();

export const OrganizationUpsertWithoutMembersInputSchema: z.ZodType<Prisma.OrganizationUpsertWithoutMembersInput> = z.object({
  update: z.union([ z.lazy(() => OrganizationUpdateWithoutMembersInputSchema),z.lazy(() => OrganizationUncheckedUpdateWithoutMembersInputSchema) ]),
  create: z.union([ z.lazy(() => OrganizationCreateWithoutMembersInputSchema),z.lazy(() => OrganizationUncheckedCreateWithoutMembersInputSchema) ]),
  where: z.lazy(() => OrganizationWhereInputSchema).optional()
}).strict();

export const OrganizationUpdateToOneWithWhereWithoutMembersInputSchema: z.ZodType<Prisma.OrganizationUpdateToOneWithWhereWithoutMembersInput> = z.object({
  where: z.lazy(() => OrganizationWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => OrganizationUpdateWithoutMembersInputSchema),z.lazy(() => OrganizationUncheckedUpdateWithoutMembersInputSchema) ]),
}).strict();

export const OrganizationUpdateWithoutMembersInputSchema: z.ZodType<Prisma.OrganizationUpdateWithoutMembersInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  slug: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  logo: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  metadata: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  paymentsCustomerId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  invitations: z.lazy(() => InvitationUpdateManyWithoutOrganizationNestedInputSchema).optional(),
  purchases: z.lazy(() => PurchaseUpdateManyWithoutOrganizationNestedInputSchema).optional(),
  aiChats: z.lazy(() => AiChatUpdateManyWithoutOrganizationNestedInputSchema).optional()
}).strict();

export const OrganizationUncheckedUpdateWithoutMembersInputSchema: z.ZodType<Prisma.OrganizationUncheckedUpdateWithoutMembersInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  slug: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  logo: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  metadata: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  paymentsCustomerId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  invitations: z.lazy(() => InvitationUncheckedUpdateManyWithoutOrganizationNestedInputSchema).optional(),
  purchases: z.lazy(() => PurchaseUncheckedUpdateManyWithoutOrganizationNestedInputSchema).optional(),
  aiChats: z.lazy(() => AiChatUncheckedUpdateManyWithoutOrganizationNestedInputSchema).optional()
}).strict();

export const UserUpsertWithoutMembershipsInputSchema: z.ZodType<Prisma.UserUpsertWithoutMembershipsInput> = z.object({
  update: z.union([ z.lazy(() => UserUpdateWithoutMembershipsInputSchema),z.lazy(() => UserUncheckedUpdateWithoutMembershipsInputSchema) ]),
  create: z.union([ z.lazy(() => UserCreateWithoutMembershipsInputSchema),z.lazy(() => UserUncheckedCreateWithoutMembershipsInputSchema) ]),
  where: z.lazy(() => UserWhereInputSchema).optional()
}).strict();

export const UserUpdateToOneWithWhereWithoutMembershipsInputSchema: z.ZodType<Prisma.UserUpdateToOneWithWhereWithoutMembershipsInput> = z.object({
  where: z.lazy(() => UserWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => UserUpdateWithoutMembershipsInputSchema),z.lazy(() => UserUncheckedUpdateWithoutMembershipsInputSchema) ]),
}).strict();

export const UserUpdateWithoutMembershipsInputSchema: z.ZodType<Prisma.UserUpdateWithoutMembershipsInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  emailVerified: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  image: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  username: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  role: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  banned: z.union([ z.boolean(),z.lazy(() => NullableBoolFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  banReason: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  banExpires: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  onboardingComplete: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  paymentsCustomerId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  locale: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  membershipLevel: z.union([ z.lazy(() => MembershipLevelSchema),z.lazy(() => EnumMembershipLevelFieldUpdateOperationsInputSchema) ]).optional(),
  sessions: z.lazy(() => SessionUpdateManyWithoutUserNestedInputSchema).optional(),
  accounts: z.lazy(() => AccountUpdateManyWithoutUserNestedInputSchema).optional(),
  passkeys: z.lazy(() => PasskeyUpdateManyWithoutUserNestedInputSchema).optional(),
  invitations: z.lazy(() => InvitationUpdateManyWithoutUserNestedInputSchema).optional(),
  purchases: z.lazy(() => PurchaseUpdateManyWithoutUserNestedInputSchema).optional(),
  aiChats: z.lazy(() => AiChatUpdateManyWithoutUserNestedInputSchema).optional(),
  subscriptions: z.lazy(() => UserSubscriptionUpdateManyWithoutUserNestedInputSchema).optional(),
  blogPosts: z.lazy(() => BlogPostUpdateManyWithoutAuthorNestedInputSchema).optional()
}).strict();

export const UserUncheckedUpdateWithoutMembershipsInputSchema: z.ZodType<Prisma.UserUncheckedUpdateWithoutMembershipsInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  emailVerified: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  image: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  username: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  role: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  banned: z.union([ z.boolean(),z.lazy(() => NullableBoolFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  banReason: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  banExpires: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  onboardingComplete: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  paymentsCustomerId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  locale: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  membershipLevel: z.union([ z.lazy(() => MembershipLevelSchema),z.lazy(() => EnumMembershipLevelFieldUpdateOperationsInputSchema) ]).optional(),
  sessions: z.lazy(() => SessionUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  accounts: z.lazy(() => AccountUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  passkeys: z.lazy(() => PasskeyUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  invitations: z.lazy(() => InvitationUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  purchases: z.lazy(() => PurchaseUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  aiChats: z.lazy(() => AiChatUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  subscriptions: z.lazy(() => UserSubscriptionUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  blogPosts: z.lazy(() => BlogPostUncheckedUpdateManyWithoutAuthorNestedInputSchema).optional()
}).strict();

export const OrganizationCreateWithoutInvitationsInputSchema: z.ZodType<Prisma.OrganizationCreateWithoutInvitationsInput> = z.object({
  id: z.string().cuid().optional(),
  name: z.string(),
  slug: z.string().optional().nullable(),
  logo: z.string().optional().nullable(),
  createdAt: z.coerce.date(),
  metadata: z.string().optional().nullable(),
  paymentsCustomerId: z.string().optional().nullable(),
  members: z.lazy(() => MemberCreateNestedManyWithoutOrganizationInputSchema).optional(),
  purchases: z.lazy(() => PurchaseCreateNestedManyWithoutOrganizationInputSchema).optional(),
  aiChats: z.lazy(() => AiChatCreateNestedManyWithoutOrganizationInputSchema).optional()
}).strict();

export const OrganizationUncheckedCreateWithoutInvitationsInputSchema: z.ZodType<Prisma.OrganizationUncheckedCreateWithoutInvitationsInput> = z.object({
  id: z.string().cuid().optional(),
  name: z.string(),
  slug: z.string().optional().nullable(),
  logo: z.string().optional().nullable(),
  createdAt: z.coerce.date(),
  metadata: z.string().optional().nullable(),
  paymentsCustomerId: z.string().optional().nullable(),
  members: z.lazy(() => MemberUncheckedCreateNestedManyWithoutOrganizationInputSchema).optional(),
  purchases: z.lazy(() => PurchaseUncheckedCreateNestedManyWithoutOrganizationInputSchema).optional(),
  aiChats: z.lazy(() => AiChatUncheckedCreateNestedManyWithoutOrganizationInputSchema).optional()
}).strict();

export const OrganizationCreateOrConnectWithoutInvitationsInputSchema: z.ZodType<Prisma.OrganizationCreateOrConnectWithoutInvitationsInput> = z.object({
  where: z.lazy(() => OrganizationWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => OrganizationCreateWithoutInvitationsInputSchema),z.lazy(() => OrganizationUncheckedCreateWithoutInvitationsInputSchema) ]),
}).strict();

export const UserCreateWithoutInvitationsInputSchema: z.ZodType<Prisma.UserCreateWithoutInvitationsInput> = z.object({
  id: z.string().cuid().optional(),
  name: z.string(),
  email: z.string(),
  emailVerified: z.boolean(),
  image: z.string().optional().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  username: z.string().optional().nullable(),
  role: z.string().optional().nullable(),
  banned: z.boolean().optional().nullable(),
  banReason: z.string().optional().nullable(),
  banExpires: z.coerce.date().optional().nullable(),
  onboardingComplete: z.boolean().optional(),
  paymentsCustomerId: z.string().optional().nullable(),
  locale: z.string().optional().nullable(),
  membershipLevel: z.lazy(() => MembershipLevelSchema).optional(),
  sessions: z.lazy(() => SessionCreateNestedManyWithoutUserInputSchema).optional(),
  accounts: z.lazy(() => AccountCreateNestedManyWithoutUserInputSchema).optional(),
  passkeys: z.lazy(() => PasskeyCreateNestedManyWithoutUserInputSchema).optional(),
  purchases: z.lazy(() => PurchaseCreateNestedManyWithoutUserInputSchema).optional(),
  memberships: z.lazy(() => MemberCreateNestedManyWithoutUserInputSchema).optional(),
  aiChats: z.lazy(() => AiChatCreateNestedManyWithoutUserInputSchema).optional(),
  subscriptions: z.lazy(() => UserSubscriptionCreateNestedManyWithoutUserInputSchema).optional(),
  blogPosts: z.lazy(() => BlogPostCreateNestedManyWithoutAuthorInputSchema).optional()
}).strict();

export const UserUncheckedCreateWithoutInvitationsInputSchema: z.ZodType<Prisma.UserUncheckedCreateWithoutInvitationsInput> = z.object({
  id: z.string().cuid().optional(),
  name: z.string(),
  email: z.string(),
  emailVerified: z.boolean(),
  image: z.string().optional().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  username: z.string().optional().nullable(),
  role: z.string().optional().nullable(),
  banned: z.boolean().optional().nullable(),
  banReason: z.string().optional().nullable(),
  banExpires: z.coerce.date().optional().nullable(),
  onboardingComplete: z.boolean().optional(),
  paymentsCustomerId: z.string().optional().nullable(),
  locale: z.string().optional().nullable(),
  membershipLevel: z.lazy(() => MembershipLevelSchema).optional(),
  sessions: z.lazy(() => SessionUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  accounts: z.lazy(() => AccountUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  passkeys: z.lazy(() => PasskeyUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  purchases: z.lazy(() => PurchaseUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  memberships: z.lazy(() => MemberUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  aiChats: z.lazy(() => AiChatUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  subscriptions: z.lazy(() => UserSubscriptionUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  blogPosts: z.lazy(() => BlogPostUncheckedCreateNestedManyWithoutAuthorInputSchema).optional()
}).strict();

export const UserCreateOrConnectWithoutInvitationsInputSchema: z.ZodType<Prisma.UserCreateOrConnectWithoutInvitationsInput> = z.object({
  where: z.lazy(() => UserWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserCreateWithoutInvitationsInputSchema),z.lazy(() => UserUncheckedCreateWithoutInvitationsInputSchema) ]),
}).strict();

export const OrganizationUpsertWithoutInvitationsInputSchema: z.ZodType<Prisma.OrganizationUpsertWithoutInvitationsInput> = z.object({
  update: z.union([ z.lazy(() => OrganizationUpdateWithoutInvitationsInputSchema),z.lazy(() => OrganizationUncheckedUpdateWithoutInvitationsInputSchema) ]),
  create: z.union([ z.lazy(() => OrganizationCreateWithoutInvitationsInputSchema),z.lazy(() => OrganizationUncheckedCreateWithoutInvitationsInputSchema) ]),
  where: z.lazy(() => OrganizationWhereInputSchema).optional()
}).strict();

export const OrganizationUpdateToOneWithWhereWithoutInvitationsInputSchema: z.ZodType<Prisma.OrganizationUpdateToOneWithWhereWithoutInvitationsInput> = z.object({
  where: z.lazy(() => OrganizationWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => OrganizationUpdateWithoutInvitationsInputSchema),z.lazy(() => OrganizationUncheckedUpdateWithoutInvitationsInputSchema) ]),
}).strict();

export const OrganizationUpdateWithoutInvitationsInputSchema: z.ZodType<Prisma.OrganizationUpdateWithoutInvitationsInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  slug: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  logo: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  metadata: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  paymentsCustomerId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  members: z.lazy(() => MemberUpdateManyWithoutOrganizationNestedInputSchema).optional(),
  purchases: z.lazy(() => PurchaseUpdateManyWithoutOrganizationNestedInputSchema).optional(),
  aiChats: z.lazy(() => AiChatUpdateManyWithoutOrganizationNestedInputSchema).optional()
}).strict();

export const OrganizationUncheckedUpdateWithoutInvitationsInputSchema: z.ZodType<Prisma.OrganizationUncheckedUpdateWithoutInvitationsInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  slug: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  logo: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  metadata: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  paymentsCustomerId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  members: z.lazy(() => MemberUncheckedUpdateManyWithoutOrganizationNestedInputSchema).optional(),
  purchases: z.lazy(() => PurchaseUncheckedUpdateManyWithoutOrganizationNestedInputSchema).optional(),
  aiChats: z.lazy(() => AiChatUncheckedUpdateManyWithoutOrganizationNestedInputSchema).optional()
}).strict();

export const UserUpsertWithoutInvitationsInputSchema: z.ZodType<Prisma.UserUpsertWithoutInvitationsInput> = z.object({
  update: z.union([ z.lazy(() => UserUpdateWithoutInvitationsInputSchema),z.lazy(() => UserUncheckedUpdateWithoutInvitationsInputSchema) ]),
  create: z.union([ z.lazy(() => UserCreateWithoutInvitationsInputSchema),z.lazy(() => UserUncheckedCreateWithoutInvitationsInputSchema) ]),
  where: z.lazy(() => UserWhereInputSchema).optional()
}).strict();

export const UserUpdateToOneWithWhereWithoutInvitationsInputSchema: z.ZodType<Prisma.UserUpdateToOneWithWhereWithoutInvitationsInput> = z.object({
  where: z.lazy(() => UserWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => UserUpdateWithoutInvitationsInputSchema),z.lazy(() => UserUncheckedUpdateWithoutInvitationsInputSchema) ]),
}).strict();

export const UserUpdateWithoutInvitationsInputSchema: z.ZodType<Prisma.UserUpdateWithoutInvitationsInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  emailVerified: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  image: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  username: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  role: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  banned: z.union([ z.boolean(),z.lazy(() => NullableBoolFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  banReason: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  banExpires: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  onboardingComplete: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  paymentsCustomerId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  locale: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  membershipLevel: z.union([ z.lazy(() => MembershipLevelSchema),z.lazy(() => EnumMembershipLevelFieldUpdateOperationsInputSchema) ]).optional(),
  sessions: z.lazy(() => SessionUpdateManyWithoutUserNestedInputSchema).optional(),
  accounts: z.lazy(() => AccountUpdateManyWithoutUserNestedInputSchema).optional(),
  passkeys: z.lazy(() => PasskeyUpdateManyWithoutUserNestedInputSchema).optional(),
  purchases: z.lazy(() => PurchaseUpdateManyWithoutUserNestedInputSchema).optional(),
  memberships: z.lazy(() => MemberUpdateManyWithoutUserNestedInputSchema).optional(),
  aiChats: z.lazy(() => AiChatUpdateManyWithoutUserNestedInputSchema).optional(),
  subscriptions: z.lazy(() => UserSubscriptionUpdateManyWithoutUserNestedInputSchema).optional(),
  blogPosts: z.lazy(() => BlogPostUpdateManyWithoutAuthorNestedInputSchema).optional()
}).strict();

export const UserUncheckedUpdateWithoutInvitationsInputSchema: z.ZodType<Prisma.UserUncheckedUpdateWithoutInvitationsInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  emailVerified: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  image: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  username: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  role: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  banned: z.union([ z.boolean(),z.lazy(() => NullableBoolFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  banReason: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  banExpires: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  onboardingComplete: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  paymentsCustomerId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  locale: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  membershipLevel: z.union([ z.lazy(() => MembershipLevelSchema),z.lazy(() => EnumMembershipLevelFieldUpdateOperationsInputSchema) ]).optional(),
  sessions: z.lazy(() => SessionUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  accounts: z.lazy(() => AccountUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  passkeys: z.lazy(() => PasskeyUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  purchases: z.lazy(() => PurchaseUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  memberships: z.lazy(() => MemberUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  aiChats: z.lazy(() => AiChatUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  subscriptions: z.lazy(() => UserSubscriptionUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  blogPosts: z.lazy(() => BlogPostUncheckedUpdateManyWithoutAuthorNestedInputSchema).optional()
}).strict();

export const OrganizationCreateWithoutPurchasesInputSchema: z.ZodType<Prisma.OrganizationCreateWithoutPurchasesInput> = z.object({
  id: z.string().cuid().optional(),
  name: z.string(),
  slug: z.string().optional().nullable(),
  logo: z.string().optional().nullable(),
  createdAt: z.coerce.date(),
  metadata: z.string().optional().nullable(),
  paymentsCustomerId: z.string().optional().nullable(),
  members: z.lazy(() => MemberCreateNestedManyWithoutOrganizationInputSchema).optional(),
  invitations: z.lazy(() => InvitationCreateNestedManyWithoutOrganizationInputSchema).optional(),
  aiChats: z.lazy(() => AiChatCreateNestedManyWithoutOrganizationInputSchema).optional()
}).strict();

export const OrganizationUncheckedCreateWithoutPurchasesInputSchema: z.ZodType<Prisma.OrganizationUncheckedCreateWithoutPurchasesInput> = z.object({
  id: z.string().cuid().optional(),
  name: z.string(),
  slug: z.string().optional().nullable(),
  logo: z.string().optional().nullable(),
  createdAt: z.coerce.date(),
  metadata: z.string().optional().nullable(),
  paymentsCustomerId: z.string().optional().nullable(),
  members: z.lazy(() => MemberUncheckedCreateNestedManyWithoutOrganizationInputSchema).optional(),
  invitations: z.lazy(() => InvitationUncheckedCreateNestedManyWithoutOrganizationInputSchema).optional(),
  aiChats: z.lazy(() => AiChatUncheckedCreateNestedManyWithoutOrganizationInputSchema).optional()
}).strict();

export const OrganizationCreateOrConnectWithoutPurchasesInputSchema: z.ZodType<Prisma.OrganizationCreateOrConnectWithoutPurchasesInput> = z.object({
  where: z.lazy(() => OrganizationWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => OrganizationCreateWithoutPurchasesInputSchema),z.lazy(() => OrganizationUncheckedCreateWithoutPurchasesInputSchema) ]),
}).strict();

export const UserCreateWithoutPurchasesInputSchema: z.ZodType<Prisma.UserCreateWithoutPurchasesInput> = z.object({
  id: z.string().cuid().optional(),
  name: z.string(),
  email: z.string(),
  emailVerified: z.boolean(),
  image: z.string().optional().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  username: z.string().optional().nullable(),
  role: z.string().optional().nullable(),
  banned: z.boolean().optional().nullable(),
  banReason: z.string().optional().nullable(),
  banExpires: z.coerce.date().optional().nullable(),
  onboardingComplete: z.boolean().optional(),
  paymentsCustomerId: z.string().optional().nullable(),
  locale: z.string().optional().nullable(),
  membershipLevel: z.lazy(() => MembershipLevelSchema).optional(),
  sessions: z.lazy(() => SessionCreateNestedManyWithoutUserInputSchema).optional(),
  accounts: z.lazy(() => AccountCreateNestedManyWithoutUserInputSchema).optional(),
  passkeys: z.lazy(() => PasskeyCreateNestedManyWithoutUserInputSchema).optional(),
  invitations: z.lazy(() => InvitationCreateNestedManyWithoutUserInputSchema).optional(),
  memberships: z.lazy(() => MemberCreateNestedManyWithoutUserInputSchema).optional(),
  aiChats: z.lazy(() => AiChatCreateNestedManyWithoutUserInputSchema).optional(),
  subscriptions: z.lazy(() => UserSubscriptionCreateNestedManyWithoutUserInputSchema).optional(),
  blogPosts: z.lazy(() => BlogPostCreateNestedManyWithoutAuthorInputSchema).optional()
}).strict();

export const UserUncheckedCreateWithoutPurchasesInputSchema: z.ZodType<Prisma.UserUncheckedCreateWithoutPurchasesInput> = z.object({
  id: z.string().cuid().optional(),
  name: z.string(),
  email: z.string(),
  emailVerified: z.boolean(),
  image: z.string().optional().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  username: z.string().optional().nullable(),
  role: z.string().optional().nullable(),
  banned: z.boolean().optional().nullable(),
  banReason: z.string().optional().nullable(),
  banExpires: z.coerce.date().optional().nullable(),
  onboardingComplete: z.boolean().optional(),
  paymentsCustomerId: z.string().optional().nullable(),
  locale: z.string().optional().nullable(),
  membershipLevel: z.lazy(() => MembershipLevelSchema).optional(),
  sessions: z.lazy(() => SessionUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  accounts: z.lazy(() => AccountUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  passkeys: z.lazy(() => PasskeyUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  invitations: z.lazy(() => InvitationUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  memberships: z.lazy(() => MemberUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  aiChats: z.lazy(() => AiChatUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  subscriptions: z.lazy(() => UserSubscriptionUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  blogPosts: z.lazy(() => BlogPostUncheckedCreateNestedManyWithoutAuthorInputSchema).optional()
}).strict();

export const UserCreateOrConnectWithoutPurchasesInputSchema: z.ZodType<Prisma.UserCreateOrConnectWithoutPurchasesInput> = z.object({
  where: z.lazy(() => UserWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserCreateWithoutPurchasesInputSchema),z.lazy(() => UserUncheckedCreateWithoutPurchasesInputSchema) ]),
}).strict();

export const OrganizationUpsertWithoutPurchasesInputSchema: z.ZodType<Prisma.OrganizationUpsertWithoutPurchasesInput> = z.object({
  update: z.union([ z.lazy(() => OrganizationUpdateWithoutPurchasesInputSchema),z.lazy(() => OrganizationUncheckedUpdateWithoutPurchasesInputSchema) ]),
  create: z.union([ z.lazy(() => OrganizationCreateWithoutPurchasesInputSchema),z.lazy(() => OrganizationUncheckedCreateWithoutPurchasesInputSchema) ]),
  where: z.lazy(() => OrganizationWhereInputSchema).optional()
}).strict();

export const OrganizationUpdateToOneWithWhereWithoutPurchasesInputSchema: z.ZodType<Prisma.OrganizationUpdateToOneWithWhereWithoutPurchasesInput> = z.object({
  where: z.lazy(() => OrganizationWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => OrganizationUpdateWithoutPurchasesInputSchema),z.lazy(() => OrganizationUncheckedUpdateWithoutPurchasesInputSchema) ]),
}).strict();

export const OrganizationUpdateWithoutPurchasesInputSchema: z.ZodType<Prisma.OrganizationUpdateWithoutPurchasesInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  slug: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  logo: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  metadata: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  paymentsCustomerId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  members: z.lazy(() => MemberUpdateManyWithoutOrganizationNestedInputSchema).optional(),
  invitations: z.lazy(() => InvitationUpdateManyWithoutOrganizationNestedInputSchema).optional(),
  aiChats: z.lazy(() => AiChatUpdateManyWithoutOrganizationNestedInputSchema).optional()
}).strict();

export const OrganizationUncheckedUpdateWithoutPurchasesInputSchema: z.ZodType<Prisma.OrganizationUncheckedUpdateWithoutPurchasesInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  slug: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  logo: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  metadata: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  paymentsCustomerId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  members: z.lazy(() => MemberUncheckedUpdateManyWithoutOrganizationNestedInputSchema).optional(),
  invitations: z.lazy(() => InvitationUncheckedUpdateManyWithoutOrganizationNestedInputSchema).optional(),
  aiChats: z.lazy(() => AiChatUncheckedUpdateManyWithoutOrganizationNestedInputSchema).optional()
}).strict();

export const UserUpsertWithoutPurchasesInputSchema: z.ZodType<Prisma.UserUpsertWithoutPurchasesInput> = z.object({
  update: z.union([ z.lazy(() => UserUpdateWithoutPurchasesInputSchema),z.lazy(() => UserUncheckedUpdateWithoutPurchasesInputSchema) ]),
  create: z.union([ z.lazy(() => UserCreateWithoutPurchasesInputSchema),z.lazy(() => UserUncheckedCreateWithoutPurchasesInputSchema) ]),
  where: z.lazy(() => UserWhereInputSchema).optional()
}).strict();

export const UserUpdateToOneWithWhereWithoutPurchasesInputSchema: z.ZodType<Prisma.UserUpdateToOneWithWhereWithoutPurchasesInput> = z.object({
  where: z.lazy(() => UserWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => UserUpdateWithoutPurchasesInputSchema),z.lazy(() => UserUncheckedUpdateWithoutPurchasesInputSchema) ]),
}).strict();

export const UserUpdateWithoutPurchasesInputSchema: z.ZodType<Prisma.UserUpdateWithoutPurchasesInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  emailVerified: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  image: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  username: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  role: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  banned: z.union([ z.boolean(),z.lazy(() => NullableBoolFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  banReason: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  banExpires: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  onboardingComplete: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  paymentsCustomerId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  locale: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  membershipLevel: z.union([ z.lazy(() => MembershipLevelSchema),z.lazy(() => EnumMembershipLevelFieldUpdateOperationsInputSchema) ]).optional(),
  sessions: z.lazy(() => SessionUpdateManyWithoutUserNestedInputSchema).optional(),
  accounts: z.lazy(() => AccountUpdateManyWithoutUserNestedInputSchema).optional(),
  passkeys: z.lazy(() => PasskeyUpdateManyWithoutUserNestedInputSchema).optional(),
  invitations: z.lazy(() => InvitationUpdateManyWithoutUserNestedInputSchema).optional(),
  memberships: z.lazy(() => MemberUpdateManyWithoutUserNestedInputSchema).optional(),
  aiChats: z.lazy(() => AiChatUpdateManyWithoutUserNestedInputSchema).optional(),
  subscriptions: z.lazy(() => UserSubscriptionUpdateManyWithoutUserNestedInputSchema).optional(),
  blogPosts: z.lazy(() => BlogPostUpdateManyWithoutAuthorNestedInputSchema).optional()
}).strict();

export const UserUncheckedUpdateWithoutPurchasesInputSchema: z.ZodType<Prisma.UserUncheckedUpdateWithoutPurchasesInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  emailVerified: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  image: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  username: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  role: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  banned: z.union([ z.boolean(),z.lazy(() => NullableBoolFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  banReason: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  banExpires: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  onboardingComplete: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  paymentsCustomerId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  locale: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  membershipLevel: z.union([ z.lazy(() => MembershipLevelSchema),z.lazy(() => EnumMembershipLevelFieldUpdateOperationsInputSchema) ]).optional(),
  sessions: z.lazy(() => SessionUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  accounts: z.lazy(() => AccountUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  passkeys: z.lazy(() => PasskeyUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  invitations: z.lazy(() => InvitationUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  memberships: z.lazy(() => MemberUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  aiChats: z.lazy(() => AiChatUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  subscriptions: z.lazy(() => UserSubscriptionUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  blogPosts: z.lazy(() => BlogPostUncheckedUpdateManyWithoutAuthorNestedInputSchema).optional()
}).strict();

export const OrganizationCreateWithoutAiChatsInputSchema: z.ZodType<Prisma.OrganizationCreateWithoutAiChatsInput> = z.object({
  id: z.string().cuid().optional(),
  name: z.string(),
  slug: z.string().optional().nullable(),
  logo: z.string().optional().nullable(),
  createdAt: z.coerce.date(),
  metadata: z.string().optional().nullable(),
  paymentsCustomerId: z.string().optional().nullable(),
  members: z.lazy(() => MemberCreateNestedManyWithoutOrganizationInputSchema).optional(),
  invitations: z.lazy(() => InvitationCreateNestedManyWithoutOrganizationInputSchema).optional(),
  purchases: z.lazy(() => PurchaseCreateNestedManyWithoutOrganizationInputSchema).optional()
}).strict();

export const OrganizationUncheckedCreateWithoutAiChatsInputSchema: z.ZodType<Prisma.OrganizationUncheckedCreateWithoutAiChatsInput> = z.object({
  id: z.string().cuid().optional(),
  name: z.string(),
  slug: z.string().optional().nullable(),
  logo: z.string().optional().nullable(),
  createdAt: z.coerce.date(),
  metadata: z.string().optional().nullable(),
  paymentsCustomerId: z.string().optional().nullable(),
  members: z.lazy(() => MemberUncheckedCreateNestedManyWithoutOrganizationInputSchema).optional(),
  invitations: z.lazy(() => InvitationUncheckedCreateNestedManyWithoutOrganizationInputSchema).optional(),
  purchases: z.lazy(() => PurchaseUncheckedCreateNestedManyWithoutOrganizationInputSchema).optional()
}).strict();

export const OrganizationCreateOrConnectWithoutAiChatsInputSchema: z.ZodType<Prisma.OrganizationCreateOrConnectWithoutAiChatsInput> = z.object({
  where: z.lazy(() => OrganizationWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => OrganizationCreateWithoutAiChatsInputSchema),z.lazy(() => OrganizationUncheckedCreateWithoutAiChatsInputSchema) ]),
}).strict();

export const UserCreateWithoutAiChatsInputSchema: z.ZodType<Prisma.UserCreateWithoutAiChatsInput> = z.object({
  id: z.string().cuid().optional(),
  name: z.string(),
  email: z.string(),
  emailVerified: z.boolean(),
  image: z.string().optional().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  username: z.string().optional().nullable(),
  role: z.string().optional().nullable(),
  banned: z.boolean().optional().nullable(),
  banReason: z.string().optional().nullable(),
  banExpires: z.coerce.date().optional().nullable(),
  onboardingComplete: z.boolean().optional(),
  paymentsCustomerId: z.string().optional().nullable(),
  locale: z.string().optional().nullable(),
  membershipLevel: z.lazy(() => MembershipLevelSchema).optional(),
  sessions: z.lazy(() => SessionCreateNestedManyWithoutUserInputSchema).optional(),
  accounts: z.lazy(() => AccountCreateNestedManyWithoutUserInputSchema).optional(),
  passkeys: z.lazy(() => PasskeyCreateNestedManyWithoutUserInputSchema).optional(),
  invitations: z.lazy(() => InvitationCreateNestedManyWithoutUserInputSchema).optional(),
  purchases: z.lazy(() => PurchaseCreateNestedManyWithoutUserInputSchema).optional(),
  memberships: z.lazy(() => MemberCreateNestedManyWithoutUserInputSchema).optional(),
  subscriptions: z.lazy(() => UserSubscriptionCreateNestedManyWithoutUserInputSchema).optional(),
  blogPosts: z.lazy(() => BlogPostCreateNestedManyWithoutAuthorInputSchema).optional()
}).strict();

export const UserUncheckedCreateWithoutAiChatsInputSchema: z.ZodType<Prisma.UserUncheckedCreateWithoutAiChatsInput> = z.object({
  id: z.string().cuid().optional(),
  name: z.string(),
  email: z.string(),
  emailVerified: z.boolean(),
  image: z.string().optional().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  username: z.string().optional().nullable(),
  role: z.string().optional().nullable(),
  banned: z.boolean().optional().nullable(),
  banReason: z.string().optional().nullable(),
  banExpires: z.coerce.date().optional().nullable(),
  onboardingComplete: z.boolean().optional(),
  paymentsCustomerId: z.string().optional().nullable(),
  locale: z.string().optional().nullable(),
  membershipLevel: z.lazy(() => MembershipLevelSchema).optional(),
  sessions: z.lazy(() => SessionUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  accounts: z.lazy(() => AccountUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  passkeys: z.lazy(() => PasskeyUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  invitations: z.lazy(() => InvitationUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  purchases: z.lazy(() => PurchaseUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  memberships: z.lazy(() => MemberUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  subscriptions: z.lazy(() => UserSubscriptionUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  blogPosts: z.lazy(() => BlogPostUncheckedCreateNestedManyWithoutAuthorInputSchema).optional()
}).strict();

export const UserCreateOrConnectWithoutAiChatsInputSchema: z.ZodType<Prisma.UserCreateOrConnectWithoutAiChatsInput> = z.object({
  where: z.lazy(() => UserWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserCreateWithoutAiChatsInputSchema),z.lazy(() => UserUncheckedCreateWithoutAiChatsInputSchema) ]),
}).strict();

export const OrganizationUpsertWithoutAiChatsInputSchema: z.ZodType<Prisma.OrganizationUpsertWithoutAiChatsInput> = z.object({
  update: z.union([ z.lazy(() => OrganizationUpdateWithoutAiChatsInputSchema),z.lazy(() => OrganizationUncheckedUpdateWithoutAiChatsInputSchema) ]),
  create: z.union([ z.lazy(() => OrganizationCreateWithoutAiChatsInputSchema),z.lazy(() => OrganizationUncheckedCreateWithoutAiChatsInputSchema) ]),
  where: z.lazy(() => OrganizationWhereInputSchema).optional()
}).strict();

export const OrganizationUpdateToOneWithWhereWithoutAiChatsInputSchema: z.ZodType<Prisma.OrganizationUpdateToOneWithWhereWithoutAiChatsInput> = z.object({
  where: z.lazy(() => OrganizationWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => OrganizationUpdateWithoutAiChatsInputSchema),z.lazy(() => OrganizationUncheckedUpdateWithoutAiChatsInputSchema) ]),
}).strict();

export const OrganizationUpdateWithoutAiChatsInputSchema: z.ZodType<Prisma.OrganizationUpdateWithoutAiChatsInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  slug: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  logo: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  metadata: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  paymentsCustomerId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  members: z.lazy(() => MemberUpdateManyWithoutOrganizationNestedInputSchema).optional(),
  invitations: z.lazy(() => InvitationUpdateManyWithoutOrganizationNestedInputSchema).optional(),
  purchases: z.lazy(() => PurchaseUpdateManyWithoutOrganizationNestedInputSchema).optional()
}).strict();

export const OrganizationUncheckedUpdateWithoutAiChatsInputSchema: z.ZodType<Prisma.OrganizationUncheckedUpdateWithoutAiChatsInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  slug: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  logo: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  metadata: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  paymentsCustomerId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  members: z.lazy(() => MemberUncheckedUpdateManyWithoutOrganizationNestedInputSchema).optional(),
  invitations: z.lazy(() => InvitationUncheckedUpdateManyWithoutOrganizationNestedInputSchema).optional(),
  purchases: z.lazy(() => PurchaseUncheckedUpdateManyWithoutOrganizationNestedInputSchema).optional()
}).strict();

export const UserUpsertWithoutAiChatsInputSchema: z.ZodType<Prisma.UserUpsertWithoutAiChatsInput> = z.object({
  update: z.union([ z.lazy(() => UserUpdateWithoutAiChatsInputSchema),z.lazy(() => UserUncheckedUpdateWithoutAiChatsInputSchema) ]),
  create: z.union([ z.lazy(() => UserCreateWithoutAiChatsInputSchema),z.lazy(() => UserUncheckedCreateWithoutAiChatsInputSchema) ]),
  where: z.lazy(() => UserWhereInputSchema).optional()
}).strict();

export const UserUpdateToOneWithWhereWithoutAiChatsInputSchema: z.ZodType<Prisma.UserUpdateToOneWithWhereWithoutAiChatsInput> = z.object({
  where: z.lazy(() => UserWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => UserUpdateWithoutAiChatsInputSchema),z.lazy(() => UserUncheckedUpdateWithoutAiChatsInputSchema) ]),
}).strict();

export const UserUpdateWithoutAiChatsInputSchema: z.ZodType<Prisma.UserUpdateWithoutAiChatsInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  emailVerified: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  image: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  username: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  role: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  banned: z.union([ z.boolean(),z.lazy(() => NullableBoolFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  banReason: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  banExpires: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  onboardingComplete: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  paymentsCustomerId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  locale: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  membershipLevel: z.union([ z.lazy(() => MembershipLevelSchema),z.lazy(() => EnumMembershipLevelFieldUpdateOperationsInputSchema) ]).optional(),
  sessions: z.lazy(() => SessionUpdateManyWithoutUserNestedInputSchema).optional(),
  accounts: z.lazy(() => AccountUpdateManyWithoutUserNestedInputSchema).optional(),
  passkeys: z.lazy(() => PasskeyUpdateManyWithoutUserNestedInputSchema).optional(),
  invitations: z.lazy(() => InvitationUpdateManyWithoutUserNestedInputSchema).optional(),
  purchases: z.lazy(() => PurchaseUpdateManyWithoutUserNestedInputSchema).optional(),
  memberships: z.lazy(() => MemberUpdateManyWithoutUserNestedInputSchema).optional(),
  subscriptions: z.lazy(() => UserSubscriptionUpdateManyWithoutUserNestedInputSchema).optional(),
  blogPosts: z.lazy(() => BlogPostUpdateManyWithoutAuthorNestedInputSchema).optional()
}).strict();

export const UserUncheckedUpdateWithoutAiChatsInputSchema: z.ZodType<Prisma.UserUncheckedUpdateWithoutAiChatsInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  emailVerified: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  image: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  username: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  role: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  banned: z.union([ z.boolean(),z.lazy(() => NullableBoolFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  banReason: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  banExpires: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  onboardingComplete: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  paymentsCustomerId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  locale: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  membershipLevel: z.union([ z.lazy(() => MembershipLevelSchema),z.lazy(() => EnumMembershipLevelFieldUpdateOperationsInputSchema) ]).optional(),
  sessions: z.lazy(() => SessionUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  accounts: z.lazy(() => AccountUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  passkeys: z.lazy(() => PasskeyUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  invitations: z.lazy(() => InvitationUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  purchases: z.lazy(() => PurchaseUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  memberships: z.lazy(() => MemberUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  subscriptions: z.lazy(() => UserSubscriptionUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  blogPosts: z.lazy(() => BlogPostUncheckedUpdateManyWithoutAuthorNestedInputSchema).optional()
}).strict();

export const UserCreateWithoutBlogPostsInputSchema: z.ZodType<Prisma.UserCreateWithoutBlogPostsInput> = z.object({
  id: z.string().cuid().optional(),
  name: z.string(),
  email: z.string(),
  emailVerified: z.boolean(),
  image: z.string().optional().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  username: z.string().optional().nullable(),
  role: z.string().optional().nullable(),
  banned: z.boolean().optional().nullable(),
  banReason: z.string().optional().nullable(),
  banExpires: z.coerce.date().optional().nullable(),
  onboardingComplete: z.boolean().optional(),
  paymentsCustomerId: z.string().optional().nullable(),
  locale: z.string().optional().nullable(),
  membershipLevel: z.lazy(() => MembershipLevelSchema).optional(),
  sessions: z.lazy(() => SessionCreateNestedManyWithoutUserInputSchema).optional(),
  accounts: z.lazy(() => AccountCreateNestedManyWithoutUserInputSchema).optional(),
  passkeys: z.lazy(() => PasskeyCreateNestedManyWithoutUserInputSchema).optional(),
  invitations: z.lazy(() => InvitationCreateNestedManyWithoutUserInputSchema).optional(),
  purchases: z.lazy(() => PurchaseCreateNestedManyWithoutUserInputSchema).optional(),
  memberships: z.lazy(() => MemberCreateNestedManyWithoutUserInputSchema).optional(),
  aiChats: z.lazy(() => AiChatCreateNestedManyWithoutUserInputSchema).optional(),
  subscriptions: z.lazy(() => UserSubscriptionCreateNestedManyWithoutUserInputSchema).optional()
}).strict();

export const UserUncheckedCreateWithoutBlogPostsInputSchema: z.ZodType<Prisma.UserUncheckedCreateWithoutBlogPostsInput> = z.object({
  id: z.string().cuid().optional(),
  name: z.string(),
  email: z.string(),
  emailVerified: z.boolean(),
  image: z.string().optional().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  username: z.string().optional().nullable(),
  role: z.string().optional().nullable(),
  banned: z.boolean().optional().nullable(),
  banReason: z.string().optional().nullable(),
  banExpires: z.coerce.date().optional().nullable(),
  onboardingComplete: z.boolean().optional(),
  paymentsCustomerId: z.string().optional().nullable(),
  locale: z.string().optional().nullable(),
  membershipLevel: z.lazy(() => MembershipLevelSchema).optional(),
  sessions: z.lazy(() => SessionUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  accounts: z.lazy(() => AccountUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  passkeys: z.lazy(() => PasskeyUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  invitations: z.lazy(() => InvitationUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  purchases: z.lazy(() => PurchaseUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  memberships: z.lazy(() => MemberUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  aiChats: z.lazy(() => AiChatUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  subscriptions: z.lazy(() => UserSubscriptionUncheckedCreateNestedManyWithoutUserInputSchema).optional()
}).strict();

export const UserCreateOrConnectWithoutBlogPostsInputSchema: z.ZodType<Prisma.UserCreateOrConnectWithoutBlogPostsInput> = z.object({
  where: z.lazy(() => UserWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserCreateWithoutBlogPostsInputSchema),z.lazy(() => UserUncheckedCreateWithoutBlogPostsInputSchema) ]),
}).strict();

export const BlogCategoryCreateWithoutPostsInputSchema: z.ZodType<Prisma.BlogCategoryCreateWithoutPostsInput> = z.object({
  id: z.string().cuid().optional(),
  name: z.string(),
  slug: z.string(),
  description: z.string().optional().nullable()
}).strict();

export const BlogCategoryUncheckedCreateWithoutPostsInputSchema: z.ZodType<Prisma.BlogCategoryUncheckedCreateWithoutPostsInput> = z.object({
  id: z.string().cuid().optional(),
  name: z.string(),
  slug: z.string(),
  description: z.string().optional().nullable()
}).strict();

export const BlogCategoryCreateOrConnectWithoutPostsInputSchema: z.ZodType<Prisma.BlogCategoryCreateOrConnectWithoutPostsInput> = z.object({
  where: z.lazy(() => BlogCategoryWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => BlogCategoryCreateWithoutPostsInputSchema),z.lazy(() => BlogCategoryUncheckedCreateWithoutPostsInputSchema) ]),
}).strict();

export const UserUpsertWithoutBlogPostsInputSchema: z.ZodType<Prisma.UserUpsertWithoutBlogPostsInput> = z.object({
  update: z.union([ z.lazy(() => UserUpdateWithoutBlogPostsInputSchema),z.lazy(() => UserUncheckedUpdateWithoutBlogPostsInputSchema) ]),
  create: z.union([ z.lazy(() => UserCreateWithoutBlogPostsInputSchema),z.lazy(() => UserUncheckedCreateWithoutBlogPostsInputSchema) ]),
  where: z.lazy(() => UserWhereInputSchema).optional()
}).strict();

export const UserUpdateToOneWithWhereWithoutBlogPostsInputSchema: z.ZodType<Prisma.UserUpdateToOneWithWhereWithoutBlogPostsInput> = z.object({
  where: z.lazy(() => UserWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => UserUpdateWithoutBlogPostsInputSchema),z.lazy(() => UserUncheckedUpdateWithoutBlogPostsInputSchema) ]),
}).strict();

export const UserUpdateWithoutBlogPostsInputSchema: z.ZodType<Prisma.UserUpdateWithoutBlogPostsInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  emailVerified: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  image: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  username: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  role: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  banned: z.union([ z.boolean(),z.lazy(() => NullableBoolFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  banReason: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  banExpires: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  onboardingComplete: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  paymentsCustomerId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  locale: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  membershipLevel: z.union([ z.lazy(() => MembershipLevelSchema),z.lazy(() => EnumMembershipLevelFieldUpdateOperationsInputSchema) ]).optional(),
  sessions: z.lazy(() => SessionUpdateManyWithoutUserNestedInputSchema).optional(),
  accounts: z.lazy(() => AccountUpdateManyWithoutUserNestedInputSchema).optional(),
  passkeys: z.lazy(() => PasskeyUpdateManyWithoutUserNestedInputSchema).optional(),
  invitations: z.lazy(() => InvitationUpdateManyWithoutUserNestedInputSchema).optional(),
  purchases: z.lazy(() => PurchaseUpdateManyWithoutUserNestedInputSchema).optional(),
  memberships: z.lazy(() => MemberUpdateManyWithoutUserNestedInputSchema).optional(),
  aiChats: z.lazy(() => AiChatUpdateManyWithoutUserNestedInputSchema).optional(),
  subscriptions: z.lazy(() => UserSubscriptionUpdateManyWithoutUserNestedInputSchema).optional()
}).strict();

export const UserUncheckedUpdateWithoutBlogPostsInputSchema: z.ZodType<Prisma.UserUncheckedUpdateWithoutBlogPostsInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  emailVerified: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  image: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  username: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  role: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  banned: z.union([ z.boolean(),z.lazy(() => NullableBoolFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  banReason: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  banExpires: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  onboardingComplete: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  paymentsCustomerId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  locale: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  membershipLevel: z.union([ z.lazy(() => MembershipLevelSchema),z.lazy(() => EnumMembershipLevelFieldUpdateOperationsInputSchema) ]).optional(),
  sessions: z.lazy(() => SessionUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  accounts: z.lazy(() => AccountUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  passkeys: z.lazy(() => PasskeyUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  invitations: z.lazy(() => InvitationUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  purchases: z.lazy(() => PurchaseUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  memberships: z.lazy(() => MemberUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  aiChats: z.lazy(() => AiChatUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  subscriptions: z.lazy(() => UserSubscriptionUncheckedUpdateManyWithoutUserNestedInputSchema).optional()
}).strict();

export const BlogCategoryUpsertWithWhereUniqueWithoutPostsInputSchema: z.ZodType<Prisma.BlogCategoryUpsertWithWhereUniqueWithoutPostsInput> = z.object({
  where: z.lazy(() => BlogCategoryWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => BlogCategoryUpdateWithoutPostsInputSchema),z.lazy(() => BlogCategoryUncheckedUpdateWithoutPostsInputSchema) ]),
  create: z.union([ z.lazy(() => BlogCategoryCreateWithoutPostsInputSchema),z.lazy(() => BlogCategoryUncheckedCreateWithoutPostsInputSchema) ]),
}).strict();

export const BlogCategoryUpdateWithWhereUniqueWithoutPostsInputSchema: z.ZodType<Prisma.BlogCategoryUpdateWithWhereUniqueWithoutPostsInput> = z.object({
  where: z.lazy(() => BlogCategoryWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => BlogCategoryUpdateWithoutPostsInputSchema),z.lazy(() => BlogCategoryUncheckedUpdateWithoutPostsInputSchema) ]),
}).strict();

export const BlogCategoryUpdateManyWithWhereWithoutPostsInputSchema: z.ZodType<Prisma.BlogCategoryUpdateManyWithWhereWithoutPostsInput> = z.object({
  where: z.lazy(() => BlogCategoryScalarWhereInputSchema),
  data: z.union([ z.lazy(() => BlogCategoryUpdateManyMutationInputSchema),z.lazy(() => BlogCategoryUncheckedUpdateManyWithoutPostsInputSchema) ]),
}).strict();

export const BlogCategoryScalarWhereInputSchema: z.ZodType<Prisma.BlogCategoryScalarWhereInput> = z.object({
  AND: z.union([ z.lazy(() => BlogCategoryScalarWhereInputSchema),z.lazy(() => BlogCategoryScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => BlogCategoryScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => BlogCategoryScalarWhereInputSchema),z.lazy(() => BlogCategoryScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  name: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  slug: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  description: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
}).strict();

export const UserSubscriptionCreateWithoutPlanInputSchema: z.ZodType<Prisma.UserSubscriptionCreateWithoutPlanInput> = z.object({
  id: z.string().cuid().optional(),
  status: z.lazy(() => SubscriptionStatusSchema),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional().nullable(),
  cancelledAt: z.coerce.date().optional().nullable(),
  paymentId: z.string().optional().nullable(),
  paymentMethod: z.string().optional().nullable(),
  amount: z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  autoRenew: z.boolean().optional(),
  nextBillingDate: z.coerce.date().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  user: z.lazy(() => UserCreateNestedOneWithoutSubscriptionsInputSchema)
}).strict();

export const UserSubscriptionUncheckedCreateWithoutPlanInputSchema: z.ZodType<Prisma.UserSubscriptionUncheckedCreateWithoutPlanInput> = z.object({
  id: z.string().cuid().optional(),
  userId: z.string(),
  status: z.lazy(() => SubscriptionStatusSchema),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional().nullable(),
  cancelledAt: z.coerce.date().optional().nullable(),
  paymentId: z.string().optional().nullable(),
  paymentMethod: z.string().optional().nullable(),
  amount: z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  autoRenew: z.boolean().optional(),
  nextBillingDate: z.coerce.date().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional()
}).strict();

export const UserSubscriptionCreateOrConnectWithoutPlanInputSchema: z.ZodType<Prisma.UserSubscriptionCreateOrConnectWithoutPlanInput> = z.object({
  where: z.lazy(() => UserSubscriptionWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserSubscriptionCreateWithoutPlanInputSchema),z.lazy(() => UserSubscriptionUncheckedCreateWithoutPlanInputSchema) ]),
}).strict();

export const UserSubscriptionCreateManyPlanInputEnvelopeSchema: z.ZodType<Prisma.UserSubscriptionCreateManyPlanInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => UserSubscriptionCreateManyPlanInputSchema),z.lazy(() => UserSubscriptionCreateManyPlanInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export const UserSubscriptionUpsertWithWhereUniqueWithoutPlanInputSchema: z.ZodType<Prisma.UserSubscriptionUpsertWithWhereUniqueWithoutPlanInput> = z.object({
  where: z.lazy(() => UserSubscriptionWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => UserSubscriptionUpdateWithoutPlanInputSchema),z.lazy(() => UserSubscriptionUncheckedUpdateWithoutPlanInputSchema) ]),
  create: z.union([ z.lazy(() => UserSubscriptionCreateWithoutPlanInputSchema),z.lazy(() => UserSubscriptionUncheckedCreateWithoutPlanInputSchema) ]),
}).strict();

export const UserSubscriptionUpdateWithWhereUniqueWithoutPlanInputSchema: z.ZodType<Prisma.UserSubscriptionUpdateWithWhereUniqueWithoutPlanInput> = z.object({
  where: z.lazy(() => UserSubscriptionWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => UserSubscriptionUpdateWithoutPlanInputSchema),z.lazy(() => UserSubscriptionUncheckedUpdateWithoutPlanInputSchema) ]),
}).strict();

export const UserSubscriptionUpdateManyWithWhereWithoutPlanInputSchema: z.ZodType<Prisma.UserSubscriptionUpdateManyWithWhereWithoutPlanInput> = z.object({
  where: z.lazy(() => UserSubscriptionScalarWhereInputSchema),
  data: z.union([ z.lazy(() => UserSubscriptionUpdateManyMutationInputSchema),z.lazy(() => UserSubscriptionUncheckedUpdateManyWithoutPlanInputSchema) ]),
}).strict();

export const UserCreateWithoutSubscriptionsInputSchema: z.ZodType<Prisma.UserCreateWithoutSubscriptionsInput> = z.object({
  id: z.string().cuid().optional(),
  name: z.string(),
  email: z.string(),
  emailVerified: z.boolean(),
  image: z.string().optional().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  username: z.string().optional().nullable(),
  role: z.string().optional().nullable(),
  banned: z.boolean().optional().nullable(),
  banReason: z.string().optional().nullable(),
  banExpires: z.coerce.date().optional().nullable(),
  onboardingComplete: z.boolean().optional(),
  paymentsCustomerId: z.string().optional().nullable(),
  locale: z.string().optional().nullable(),
  membershipLevel: z.lazy(() => MembershipLevelSchema).optional(),
  sessions: z.lazy(() => SessionCreateNestedManyWithoutUserInputSchema).optional(),
  accounts: z.lazy(() => AccountCreateNestedManyWithoutUserInputSchema).optional(),
  passkeys: z.lazy(() => PasskeyCreateNestedManyWithoutUserInputSchema).optional(),
  invitations: z.lazy(() => InvitationCreateNestedManyWithoutUserInputSchema).optional(),
  purchases: z.lazy(() => PurchaseCreateNestedManyWithoutUserInputSchema).optional(),
  memberships: z.lazy(() => MemberCreateNestedManyWithoutUserInputSchema).optional(),
  aiChats: z.lazy(() => AiChatCreateNestedManyWithoutUserInputSchema).optional(),
  blogPosts: z.lazy(() => BlogPostCreateNestedManyWithoutAuthorInputSchema).optional()
}).strict();

export const UserUncheckedCreateWithoutSubscriptionsInputSchema: z.ZodType<Prisma.UserUncheckedCreateWithoutSubscriptionsInput> = z.object({
  id: z.string().cuid().optional(),
  name: z.string(),
  email: z.string(),
  emailVerified: z.boolean(),
  image: z.string().optional().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  username: z.string().optional().nullable(),
  role: z.string().optional().nullable(),
  banned: z.boolean().optional().nullable(),
  banReason: z.string().optional().nullable(),
  banExpires: z.coerce.date().optional().nullable(),
  onboardingComplete: z.boolean().optional(),
  paymentsCustomerId: z.string().optional().nullable(),
  locale: z.string().optional().nullable(),
  membershipLevel: z.lazy(() => MembershipLevelSchema).optional(),
  sessions: z.lazy(() => SessionUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  accounts: z.lazy(() => AccountUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  passkeys: z.lazy(() => PasskeyUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  invitations: z.lazy(() => InvitationUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  purchases: z.lazy(() => PurchaseUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  memberships: z.lazy(() => MemberUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  aiChats: z.lazy(() => AiChatUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  blogPosts: z.lazy(() => BlogPostUncheckedCreateNestedManyWithoutAuthorInputSchema).optional()
}).strict();

export const UserCreateOrConnectWithoutSubscriptionsInputSchema: z.ZodType<Prisma.UserCreateOrConnectWithoutSubscriptionsInput> = z.object({
  where: z.lazy(() => UserWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserCreateWithoutSubscriptionsInputSchema),z.lazy(() => UserUncheckedCreateWithoutSubscriptionsInputSchema) ]),
}).strict();

export const SubscriptionPlanCreateWithoutSubscriptionsInputSchema: z.ZodType<Prisma.SubscriptionPlanCreateWithoutSubscriptionsInput> = z.object({
  id: z.string().cuid().optional(),
  name: z.string(),
  slug: z.string(),
  description: z.string().optional().nullable(),
  price: z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  currency: z.string().optional(),
  interval: z.lazy(() => PlanIntervalSchema),
  intervalCount: z.number().int().optional(),
  features: z.union([ z.lazy(() => JsonNullValueInputSchema),InputJsonValueSchema ]),
  active: z.boolean().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional()
}).strict();

export const SubscriptionPlanUncheckedCreateWithoutSubscriptionsInputSchema: z.ZodType<Prisma.SubscriptionPlanUncheckedCreateWithoutSubscriptionsInput> = z.object({
  id: z.string().cuid().optional(),
  name: z.string(),
  slug: z.string(),
  description: z.string().optional().nullable(),
  price: z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  currency: z.string().optional(),
  interval: z.lazy(() => PlanIntervalSchema),
  intervalCount: z.number().int().optional(),
  features: z.union([ z.lazy(() => JsonNullValueInputSchema),InputJsonValueSchema ]),
  active: z.boolean().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional()
}).strict();

export const SubscriptionPlanCreateOrConnectWithoutSubscriptionsInputSchema: z.ZodType<Prisma.SubscriptionPlanCreateOrConnectWithoutSubscriptionsInput> = z.object({
  where: z.lazy(() => SubscriptionPlanWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => SubscriptionPlanCreateWithoutSubscriptionsInputSchema),z.lazy(() => SubscriptionPlanUncheckedCreateWithoutSubscriptionsInputSchema) ]),
}).strict();

export const UserUpsertWithoutSubscriptionsInputSchema: z.ZodType<Prisma.UserUpsertWithoutSubscriptionsInput> = z.object({
  update: z.union([ z.lazy(() => UserUpdateWithoutSubscriptionsInputSchema),z.lazy(() => UserUncheckedUpdateWithoutSubscriptionsInputSchema) ]),
  create: z.union([ z.lazy(() => UserCreateWithoutSubscriptionsInputSchema),z.lazy(() => UserUncheckedCreateWithoutSubscriptionsInputSchema) ]),
  where: z.lazy(() => UserWhereInputSchema).optional()
}).strict();

export const UserUpdateToOneWithWhereWithoutSubscriptionsInputSchema: z.ZodType<Prisma.UserUpdateToOneWithWhereWithoutSubscriptionsInput> = z.object({
  where: z.lazy(() => UserWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => UserUpdateWithoutSubscriptionsInputSchema),z.lazy(() => UserUncheckedUpdateWithoutSubscriptionsInputSchema) ]),
}).strict();

export const UserUpdateWithoutSubscriptionsInputSchema: z.ZodType<Prisma.UserUpdateWithoutSubscriptionsInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  emailVerified: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  image: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  username: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  role: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  banned: z.union([ z.boolean(),z.lazy(() => NullableBoolFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  banReason: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  banExpires: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  onboardingComplete: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  paymentsCustomerId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  locale: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  membershipLevel: z.union([ z.lazy(() => MembershipLevelSchema),z.lazy(() => EnumMembershipLevelFieldUpdateOperationsInputSchema) ]).optional(),
  sessions: z.lazy(() => SessionUpdateManyWithoutUserNestedInputSchema).optional(),
  accounts: z.lazy(() => AccountUpdateManyWithoutUserNestedInputSchema).optional(),
  passkeys: z.lazy(() => PasskeyUpdateManyWithoutUserNestedInputSchema).optional(),
  invitations: z.lazy(() => InvitationUpdateManyWithoutUserNestedInputSchema).optional(),
  purchases: z.lazy(() => PurchaseUpdateManyWithoutUserNestedInputSchema).optional(),
  memberships: z.lazy(() => MemberUpdateManyWithoutUserNestedInputSchema).optional(),
  aiChats: z.lazy(() => AiChatUpdateManyWithoutUserNestedInputSchema).optional(),
  blogPosts: z.lazy(() => BlogPostUpdateManyWithoutAuthorNestedInputSchema).optional()
}).strict();

export const UserUncheckedUpdateWithoutSubscriptionsInputSchema: z.ZodType<Prisma.UserUncheckedUpdateWithoutSubscriptionsInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  emailVerified: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  image: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  username: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  role: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  banned: z.union([ z.boolean(),z.lazy(() => NullableBoolFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  banReason: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  banExpires: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  onboardingComplete: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  paymentsCustomerId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  locale: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  membershipLevel: z.union([ z.lazy(() => MembershipLevelSchema),z.lazy(() => EnumMembershipLevelFieldUpdateOperationsInputSchema) ]).optional(),
  sessions: z.lazy(() => SessionUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  accounts: z.lazy(() => AccountUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  passkeys: z.lazy(() => PasskeyUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  invitations: z.lazy(() => InvitationUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  purchases: z.lazy(() => PurchaseUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  memberships: z.lazy(() => MemberUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  aiChats: z.lazy(() => AiChatUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  blogPosts: z.lazy(() => BlogPostUncheckedUpdateManyWithoutAuthorNestedInputSchema).optional()
}).strict();

export const SubscriptionPlanUpsertWithoutSubscriptionsInputSchema: z.ZodType<Prisma.SubscriptionPlanUpsertWithoutSubscriptionsInput> = z.object({
  update: z.union([ z.lazy(() => SubscriptionPlanUpdateWithoutSubscriptionsInputSchema),z.lazy(() => SubscriptionPlanUncheckedUpdateWithoutSubscriptionsInputSchema) ]),
  create: z.union([ z.lazy(() => SubscriptionPlanCreateWithoutSubscriptionsInputSchema),z.lazy(() => SubscriptionPlanUncheckedCreateWithoutSubscriptionsInputSchema) ]),
  where: z.lazy(() => SubscriptionPlanWhereInputSchema).optional()
}).strict();

export const SubscriptionPlanUpdateToOneWithWhereWithoutSubscriptionsInputSchema: z.ZodType<Prisma.SubscriptionPlanUpdateToOneWithWhereWithoutSubscriptionsInput> = z.object({
  where: z.lazy(() => SubscriptionPlanWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => SubscriptionPlanUpdateWithoutSubscriptionsInputSchema),z.lazy(() => SubscriptionPlanUncheckedUpdateWithoutSubscriptionsInputSchema) ]),
}).strict();

export const SubscriptionPlanUpdateWithoutSubscriptionsInputSchema: z.ZodType<Prisma.SubscriptionPlanUpdateWithoutSubscriptionsInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  slug: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  price: z.union([ z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  currency: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  interval: z.union([ z.lazy(() => PlanIntervalSchema),z.lazy(() => EnumPlanIntervalFieldUpdateOperationsInputSchema) ]).optional(),
  intervalCount: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  features: z.union([ z.lazy(() => JsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  active: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const SubscriptionPlanUncheckedUpdateWithoutSubscriptionsInputSchema: z.ZodType<Prisma.SubscriptionPlanUncheckedUpdateWithoutSubscriptionsInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  slug: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  price: z.union([ z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  currency: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  interval: z.union([ z.lazy(() => PlanIntervalSchema),z.lazy(() => EnumPlanIntervalFieldUpdateOperationsInputSchema) ]).optional(),
  intervalCount: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  features: z.union([ z.lazy(() => JsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  active: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const BlogPostCreateWithoutCategoriesInputSchema: z.ZodType<Prisma.BlogPostCreateWithoutCategoriesInput> = z.object({
  id: z.string().cuid().optional(),
  slug: z.string(),
  title: z.string(),
  excerpt: z.string().optional().nullable(),
  content: z.string(),
  image: z.string().optional().nullable(),
  accessLevel: z.lazy(() => AccessLevelSchema).optional(),
  previewContent: z.string().optional().nullable(),
  tags: z.union([ z.lazy(() => BlogPostCreatetagsInputSchema),z.string().array() ]).optional(),
  published: z.boolean().optional(),
  publishedAt: z.coerce.date().optional().nullable(),
  viewCount: z.number().int().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  author: z.lazy(() => UserCreateNestedOneWithoutBlogPostsInputSchema)
}).strict();

export const BlogPostUncheckedCreateWithoutCategoriesInputSchema: z.ZodType<Prisma.BlogPostUncheckedCreateWithoutCategoriesInput> = z.object({
  id: z.string().cuid().optional(),
  slug: z.string(),
  title: z.string(),
  excerpt: z.string().optional().nullable(),
  content: z.string(),
  image: z.string().optional().nullable(),
  authorId: z.string(),
  accessLevel: z.lazy(() => AccessLevelSchema).optional(),
  previewContent: z.string().optional().nullable(),
  tags: z.union([ z.lazy(() => BlogPostCreatetagsInputSchema),z.string().array() ]).optional(),
  published: z.boolean().optional(),
  publishedAt: z.coerce.date().optional().nullable(),
  viewCount: z.number().int().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional()
}).strict();

export const BlogPostCreateOrConnectWithoutCategoriesInputSchema: z.ZodType<Prisma.BlogPostCreateOrConnectWithoutCategoriesInput> = z.object({
  where: z.lazy(() => BlogPostWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => BlogPostCreateWithoutCategoriesInputSchema),z.lazy(() => BlogPostUncheckedCreateWithoutCategoriesInputSchema) ]),
}).strict();

export const BlogPostUpsertWithWhereUniqueWithoutCategoriesInputSchema: z.ZodType<Prisma.BlogPostUpsertWithWhereUniqueWithoutCategoriesInput> = z.object({
  where: z.lazy(() => BlogPostWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => BlogPostUpdateWithoutCategoriesInputSchema),z.lazy(() => BlogPostUncheckedUpdateWithoutCategoriesInputSchema) ]),
  create: z.union([ z.lazy(() => BlogPostCreateWithoutCategoriesInputSchema),z.lazy(() => BlogPostUncheckedCreateWithoutCategoriesInputSchema) ]),
}).strict();

export const BlogPostUpdateWithWhereUniqueWithoutCategoriesInputSchema: z.ZodType<Prisma.BlogPostUpdateWithWhereUniqueWithoutCategoriesInput> = z.object({
  where: z.lazy(() => BlogPostWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => BlogPostUpdateWithoutCategoriesInputSchema),z.lazy(() => BlogPostUncheckedUpdateWithoutCategoriesInputSchema) ]),
}).strict();

export const BlogPostUpdateManyWithWhereWithoutCategoriesInputSchema: z.ZodType<Prisma.BlogPostUpdateManyWithWhereWithoutCategoriesInput> = z.object({
  where: z.lazy(() => BlogPostScalarWhereInputSchema),
  data: z.union([ z.lazy(() => BlogPostUpdateManyMutationInputSchema),z.lazy(() => BlogPostUncheckedUpdateManyWithoutCategoriesInputSchema) ]),
}).strict();

export const SessionCreateManyUserInputSchema: z.ZodType<Prisma.SessionCreateManyUserInput> = z.object({
  id: z.string().cuid().optional(),
  expiresAt: z.coerce.date(),
  ipAddress: z.string().optional().nullable(),
  userAgent: z.string().optional().nullable(),
  impersonatedBy: z.string().optional().nullable(),
  activeOrganizationId: z.string().optional().nullable(),
  token: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date()
}).strict();

export const AccountCreateManyUserInputSchema: z.ZodType<Prisma.AccountCreateManyUserInput> = z.object({
  id: z.string().cuid().optional(),
  accountId: z.string(),
  providerId: z.string(),
  accessToken: z.string().optional().nullable(),
  refreshToken: z.string().optional().nullable(),
  idToken: z.string().optional().nullable(),
  expiresAt: z.coerce.date().optional().nullable(),
  password: z.string().optional().nullable(),
  accessTokenExpiresAt: z.coerce.date().optional().nullable(),
  refreshTokenExpiresAt: z.coerce.date().optional().nullable(),
  scope: z.string().optional().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date()
}).strict();

export const PasskeyCreateManyUserInputSchema: z.ZodType<Prisma.PasskeyCreateManyUserInput> = z.object({
  id: z.string().cuid().optional(),
  name: z.string().optional().nullable(),
  publicKey: z.string(),
  credentialID: z.string(),
  counter: z.number().int(),
  deviceType: z.string(),
  backedUp: z.boolean(),
  transports: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional().nullable()
}).strict();

export const InvitationCreateManyUserInputSchema: z.ZodType<Prisma.InvitationCreateManyUserInput> = z.object({
  id: z.string().cuid().optional(),
  organizationId: z.string(),
  email: z.string(),
  role: z.string().optional().nullable(),
  status: z.string(),
  expiresAt: z.coerce.date()
}).strict();

export const PurchaseCreateManyUserInputSchema: z.ZodType<Prisma.PurchaseCreateManyUserInput> = z.object({
  id: z.string().cuid().optional(),
  organizationId: z.string().optional().nullable(),
  type: z.lazy(() => PurchaseTypeSchema),
  customerId: z.string(),
  subscriptionId: z.string().optional().nullable(),
  productId: z.string(),
  status: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional()
}).strict();

export const MemberCreateManyUserInputSchema: z.ZodType<Prisma.MemberCreateManyUserInput> = z.object({
  id: z.string().cuid().optional(),
  organizationId: z.string(),
  role: z.string(),
  createdAt: z.coerce.date()
}).strict();

export const AiChatCreateManyUserInputSchema: z.ZodType<Prisma.AiChatCreateManyUserInput> = z.object({
  id: z.string().cuid().optional(),
  organizationId: z.string().optional().nullable(),
  title: z.string().optional().nullable(),
  messages: z.union([ z.lazy(() => JsonNullValueInputSchema),z.array(z.object({ role: z.enum(['user', 'assistant']), content: z.string() })) ]).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional()
}).strict();

export const UserSubscriptionCreateManyUserInputSchema: z.ZodType<Prisma.UserSubscriptionCreateManyUserInput> = z.object({
  id: z.string().cuid().optional(),
  planId: z.string(),
  status: z.lazy(() => SubscriptionStatusSchema),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional().nullable(),
  cancelledAt: z.coerce.date().optional().nullable(),
  paymentId: z.string().optional().nullable(),
  paymentMethod: z.string().optional().nullable(),
  amount: z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  autoRenew: z.boolean().optional(),
  nextBillingDate: z.coerce.date().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional()
}).strict();

export const BlogPostCreateManyAuthorInputSchema: z.ZodType<Prisma.BlogPostCreateManyAuthorInput> = z.object({
  id: z.string().cuid().optional(),
  slug: z.string(),
  title: z.string(),
  excerpt: z.string().optional().nullable(),
  content: z.string(),
  image: z.string().optional().nullable(),
  accessLevel: z.lazy(() => AccessLevelSchema).optional(),
  previewContent: z.string().optional().nullable(),
  tags: z.union([ z.lazy(() => BlogPostCreatetagsInputSchema),z.string().array() ]).optional(),
  published: z.boolean().optional(),
  publishedAt: z.coerce.date().optional().nullable(),
  viewCount: z.number().int().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional()
}).strict();

export const SessionUpdateWithoutUserInputSchema: z.ZodType<Prisma.SessionUpdateWithoutUserInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  expiresAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  ipAddress: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  userAgent: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  impersonatedBy: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  activeOrganizationId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  token: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const SessionUncheckedUpdateWithoutUserInputSchema: z.ZodType<Prisma.SessionUncheckedUpdateWithoutUserInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  expiresAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  ipAddress: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  userAgent: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  impersonatedBy: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  activeOrganizationId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  token: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const SessionUncheckedUpdateManyWithoutUserInputSchema: z.ZodType<Prisma.SessionUncheckedUpdateManyWithoutUserInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  expiresAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  ipAddress: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  userAgent: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  impersonatedBy: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  activeOrganizationId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  token: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const AccountUpdateWithoutUserInputSchema: z.ZodType<Prisma.AccountUpdateWithoutUserInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  accountId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  providerId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  accessToken: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  refreshToken: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  idToken: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  expiresAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  password: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  accessTokenExpiresAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  refreshTokenExpiresAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  scope: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const AccountUncheckedUpdateWithoutUserInputSchema: z.ZodType<Prisma.AccountUncheckedUpdateWithoutUserInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  accountId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  providerId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  accessToken: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  refreshToken: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  idToken: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  expiresAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  password: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  accessTokenExpiresAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  refreshTokenExpiresAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  scope: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const AccountUncheckedUpdateManyWithoutUserInputSchema: z.ZodType<Prisma.AccountUncheckedUpdateManyWithoutUserInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  accountId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  providerId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  accessToken: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  refreshToken: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  idToken: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  expiresAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  password: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  accessTokenExpiresAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  refreshTokenExpiresAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  scope: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const PasskeyUpdateWithoutUserInputSchema: z.ZodType<Prisma.PasskeyUpdateWithoutUserInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  publicKey: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  credentialID: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  counter: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  deviceType: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  backedUp: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  transports: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
}).strict();

export const PasskeyUncheckedUpdateWithoutUserInputSchema: z.ZodType<Prisma.PasskeyUncheckedUpdateWithoutUserInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  publicKey: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  credentialID: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  counter: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  deviceType: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  backedUp: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  transports: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
}).strict();

export const PasskeyUncheckedUpdateManyWithoutUserInputSchema: z.ZodType<Prisma.PasskeyUncheckedUpdateManyWithoutUserInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  publicKey: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  credentialID: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  counter: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  deviceType: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  backedUp: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  transports: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
}).strict();

export const InvitationUpdateWithoutUserInputSchema: z.ZodType<Prisma.InvitationUpdateWithoutUserInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  role: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  status: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  expiresAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  organization: z.lazy(() => OrganizationUpdateOneRequiredWithoutInvitationsNestedInputSchema).optional()
}).strict();

export const InvitationUncheckedUpdateWithoutUserInputSchema: z.ZodType<Prisma.InvitationUncheckedUpdateWithoutUserInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  organizationId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  role: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  status: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  expiresAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const InvitationUncheckedUpdateManyWithoutUserInputSchema: z.ZodType<Prisma.InvitationUncheckedUpdateManyWithoutUserInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  organizationId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  role: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  status: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  expiresAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const PurchaseUpdateWithoutUserInputSchema: z.ZodType<Prisma.PurchaseUpdateWithoutUserInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.lazy(() => PurchaseTypeSchema),z.lazy(() => EnumPurchaseTypeFieldUpdateOperationsInputSchema) ]).optional(),
  customerId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  subscriptionId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  productId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  organization: z.lazy(() => OrganizationUpdateOneWithoutPurchasesNestedInputSchema).optional()
}).strict();

export const PurchaseUncheckedUpdateWithoutUserInputSchema: z.ZodType<Prisma.PurchaseUncheckedUpdateWithoutUserInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  organizationId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  type: z.union([ z.lazy(() => PurchaseTypeSchema),z.lazy(() => EnumPurchaseTypeFieldUpdateOperationsInputSchema) ]).optional(),
  customerId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  subscriptionId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  productId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const PurchaseUncheckedUpdateManyWithoutUserInputSchema: z.ZodType<Prisma.PurchaseUncheckedUpdateManyWithoutUserInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  organizationId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  type: z.union([ z.lazy(() => PurchaseTypeSchema),z.lazy(() => EnumPurchaseTypeFieldUpdateOperationsInputSchema) ]).optional(),
  customerId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  subscriptionId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  productId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const MemberUpdateWithoutUserInputSchema: z.ZodType<Prisma.MemberUpdateWithoutUserInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  role: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  organization: z.lazy(() => OrganizationUpdateOneRequiredWithoutMembersNestedInputSchema).optional()
}).strict();

export const MemberUncheckedUpdateWithoutUserInputSchema: z.ZodType<Prisma.MemberUncheckedUpdateWithoutUserInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  organizationId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  role: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const MemberUncheckedUpdateManyWithoutUserInputSchema: z.ZodType<Prisma.MemberUncheckedUpdateManyWithoutUserInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  organizationId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  role: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const AiChatUpdateWithoutUserInputSchema: z.ZodType<Prisma.AiChatUpdateWithoutUserInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  title: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  messages: z.union([ z.lazy(() => JsonNullValueInputSchema),z.array(z.object({ role: z.enum(['user', 'assistant']), content: z.string() })) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  organization: z.lazy(() => OrganizationUpdateOneWithoutAiChatsNestedInputSchema).optional()
}).strict();

export const AiChatUncheckedUpdateWithoutUserInputSchema: z.ZodType<Prisma.AiChatUncheckedUpdateWithoutUserInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  organizationId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  title: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  messages: z.union([ z.lazy(() => JsonNullValueInputSchema),z.array(z.object({ role: z.enum(['user', 'assistant']), content: z.string() })) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const AiChatUncheckedUpdateManyWithoutUserInputSchema: z.ZodType<Prisma.AiChatUncheckedUpdateManyWithoutUserInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  organizationId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  title: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  messages: z.union([ z.lazy(() => JsonNullValueInputSchema),z.array(z.object({ role: z.enum(['user', 'assistant']), content: z.string() })) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const UserSubscriptionUpdateWithoutUserInputSchema: z.ZodType<Prisma.UserSubscriptionUpdateWithoutUserInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => SubscriptionStatusSchema),z.lazy(() => EnumSubscriptionStatusFieldUpdateOperationsInputSchema) ]).optional(),
  startDate: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  endDate: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  cancelledAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  paymentId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  paymentMethod: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  amount: z.union([ z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  autoRenew: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  nextBillingDate: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  plan: z.lazy(() => SubscriptionPlanUpdateOneRequiredWithoutSubscriptionsNestedInputSchema).optional()
}).strict();

export const UserSubscriptionUncheckedUpdateWithoutUserInputSchema: z.ZodType<Prisma.UserSubscriptionUncheckedUpdateWithoutUserInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  planId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => SubscriptionStatusSchema),z.lazy(() => EnumSubscriptionStatusFieldUpdateOperationsInputSchema) ]).optional(),
  startDate: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  endDate: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  cancelledAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  paymentId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  paymentMethod: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  amount: z.union([ z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  autoRenew: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  nextBillingDate: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const UserSubscriptionUncheckedUpdateManyWithoutUserInputSchema: z.ZodType<Prisma.UserSubscriptionUncheckedUpdateManyWithoutUserInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  planId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => SubscriptionStatusSchema),z.lazy(() => EnumSubscriptionStatusFieldUpdateOperationsInputSchema) ]).optional(),
  startDate: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  endDate: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  cancelledAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  paymentId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  paymentMethod: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  amount: z.union([ z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  autoRenew: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  nextBillingDate: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const BlogPostUpdateWithoutAuthorInputSchema: z.ZodType<Prisma.BlogPostUpdateWithoutAuthorInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  slug: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  title: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  excerpt: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  content: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  image: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  accessLevel: z.union([ z.lazy(() => AccessLevelSchema),z.lazy(() => EnumAccessLevelFieldUpdateOperationsInputSchema) ]).optional(),
  previewContent: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  tags: z.union([ z.lazy(() => BlogPostUpdatetagsInputSchema),z.string().array() ]).optional(),
  published: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  publishedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  viewCount: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  categories: z.lazy(() => BlogCategoryUpdateManyWithoutPostsNestedInputSchema).optional()
}).strict();

export const BlogPostUncheckedUpdateWithoutAuthorInputSchema: z.ZodType<Prisma.BlogPostUncheckedUpdateWithoutAuthorInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  slug: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  title: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  excerpt: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  content: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  image: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  accessLevel: z.union([ z.lazy(() => AccessLevelSchema),z.lazy(() => EnumAccessLevelFieldUpdateOperationsInputSchema) ]).optional(),
  previewContent: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  tags: z.union([ z.lazy(() => BlogPostUpdatetagsInputSchema),z.string().array() ]).optional(),
  published: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  publishedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  viewCount: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  categories: z.lazy(() => BlogCategoryUncheckedUpdateManyWithoutPostsNestedInputSchema).optional()
}).strict();

export const BlogPostUncheckedUpdateManyWithoutAuthorInputSchema: z.ZodType<Prisma.BlogPostUncheckedUpdateManyWithoutAuthorInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  slug: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  title: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  excerpt: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  content: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  image: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  accessLevel: z.union([ z.lazy(() => AccessLevelSchema),z.lazy(() => EnumAccessLevelFieldUpdateOperationsInputSchema) ]).optional(),
  previewContent: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  tags: z.union([ z.lazy(() => BlogPostUpdatetagsInputSchema),z.string().array() ]).optional(),
  published: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  publishedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  viewCount: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const MemberCreateManyOrganizationInputSchema: z.ZodType<Prisma.MemberCreateManyOrganizationInput> = z.object({
  id: z.string().cuid().optional(),
  userId: z.string(),
  role: z.string(),
  createdAt: z.coerce.date()
}).strict();

export const InvitationCreateManyOrganizationInputSchema: z.ZodType<Prisma.InvitationCreateManyOrganizationInput> = z.object({
  id: z.string().cuid().optional(),
  email: z.string(),
  role: z.string().optional().nullable(),
  status: z.string(),
  expiresAt: z.coerce.date(),
  inviterId: z.string()
}).strict();

export const PurchaseCreateManyOrganizationInputSchema: z.ZodType<Prisma.PurchaseCreateManyOrganizationInput> = z.object({
  id: z.string().cuid().optional(),
  userId: z.string().optional().nullable(),
  type: z.lazy(() => PurchaseTypeSchema),
  customerId: z.string(),
  subscriptionId: z.string().optional().nullable(),
  productId: z.string(),
  status: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional()
}).strict();

export const AiChatCreateManyOrganizationInputSchema: z.ZodType<Prisma.AiChatCreateManyOrganizationInput> = z.object({
  id: z.string().cuid().optional(),
  userId: z.string().optional().nullable(),
  title: z.string().optional().nullable(),
  messages: z.union([ z.lazy(() => JsonNullValueInputSchema),z.array(z.object({ role: z.enum(['user', 'assistant']), content: z.string() })) ]).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional()
}).strict();

export const MemberUpdateWithoutOrganizationInputSchema: z.ZodType<Prisma.MemberUpdateWithoutOrganizationInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  role: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  user: z.lazy(() => UserUpdateOneRequiredWithoutMembershipsNestedInputSchema).optional()
}).strict();

export const MemberUncheckedUpdateWithoutOrganizationInputSchema: z.ZodType<Prisma.MemberUncheckedUpdateWithoutOrganizationInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  role: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const MemberUncheckedUpdateManyWithoutOrganizationInputSchema: z.ZodType<Prisma.MemberUncheckedUpdateManyWithoutOrganizationInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  role: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const InvitationUpdateWithoutOrganizationInputSchema: z.ZodType<Prisma.InvitationUpdateWithoutOrganizationInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  role: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  status: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  expiresAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  user: z.lazy(() => UserUpdateOneRequiredWithoutInvitationsNestedInputSchema).optional()
}).strict();

export const InvitationUncheckedUpdateWithoutOrganizationInputSchema: z.ZodType<Prisma.InvitationUncheckedUpdateWithoutOrganizationInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  role: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  status: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  expiresAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  inviterId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const InvitationUncheckedUpdateManyWithoutOrganizationInputSchema: z.ZodType<Prisma.InvitationUncheckedUpdateManyWithoutOrganizationInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  role: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  status: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  expiresAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  inviterId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const PurchaseUpdateWithoutOrganizationInputSchema: z.ZodType<Prisma.PurchaseUpdateWithoutOrganizationInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.lazy(() => PurchaseTypeSchema),z.lazy(() => EnumPurchaseTypeFieldUpdateOperationsInputSchema) ]).optional(),
  customerId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  subscriptionId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  productId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  user: z.lazy(() => UserUpdateOneWithoutPurchasesNestedInputSchema).optional()
}).strict();

export const PurchaseUncheckedUpdateWithoutOrganizationInputSchema: z.ZodType<Prisma.PurchaseUncheckedUpdateWithoutOrganizationInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  type: z.union([ z.lazy(() => PurchaseTypeSchema),z.lazy(() => EnumPurchaseTypeFieldUpdateOperationsInputSchema) ]).optional(),
  customerId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  subscriptionId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  productId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const PurchaseUncheckedUpdateManyWithoutOrganizationInputSchema: z.ZodType<Prisma.PurchaseUncheckedUpdateManyWithoutOrganizationInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  type: z.union([ z.lazy(() => PurchaseTypeSchema),z.lazy(() => EnumPurchaseTypeFieldUpdateOperationsInputSchema) ]).optional(),
  customerId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  subscriptionId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  productId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const AiChatUpdateWithoutOrganizationInputSchema: z.ZodType<Prisma.AiChatUpdateWithoutOrganizationInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  title: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  messages: z.union([ z.lazy(() => JsonNullValueInputSchema),z.array(z.object({ role: z.enum(['user', 'assistant']), content: z.string() })) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  user: z.lazy(() => UserUpdateOneWithoutAiChatsNestedInputSchema).optional()
}).strict();

export const AiChatUncheckedUpdateWithoutOrganizationInputSchema: z.ZodType<Prisma.AiChatUncheckedUpdateWithoutOrganizationInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  title: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  messages: z.union([ z.lazy(() => JsonNullValueInputSchema),z.array(z.object({ role: z.enum(['user', 'assistant']), content: z.string() })) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const AiChatUncheckedUpdateManyWithoutOrganizationInputSchema: z.ZodType<Prisma.AiChatUncheckedUpdateManyWithoutOrganizationInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  title: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  messages: z.union([ z.lazy(() => JsonNullValueInputSchema),z.array(z.object({ role: z.enum(['user', 'assistant']), content: z.string() })) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const BlogCategoryUpdateWithoutPostsInputSchema: z.ZodType<Prisma.BlogCategoryUpdateWithoutPostsInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  slug: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
}).strict();

export const BlogCategoryUncheckedUpdateWithoutPostsInputSchema: z.ZodType<Prisma.BlogCategoryUncheckedUpdateWithoutPostsInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  slug: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
}).strict();

export const BlogCategoryUncheckedUpdateManyWithoutPostsInputSchema: z.ZodType<Prisma.BlogCategoryUncheckedUpdateManyWithoutPostsInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  slug: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
}).strict();

export const UserSubscriptionCreateManyPlanInputSchema: z.ZodType<Prisma.UserSubscriptionCreateManyPlanInput> = z.object({
  id: z.string().cuid().optional(),
  userId: z.string(),
  status: z.lazy(() => SubscriptionStatusSchema),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional().nullable(),
  cancelledAt: z.coerce.date().optional().nullable(),
  paymentId: z.string().optional().nullable(),
  paymentMethod: z.string().optional().nullable(),
  amount: z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  autoRenew: z.boolean().optional(),
  nextBillingDate: z.coerce.date().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional()
}).strict();

export const UserSubscriptionUpdateWithoutPlanInputSchema: z.ZodType<Prisma.UserSubscriptionUpdateWithoutPlanInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => SubscriptionStatusSchema),z.lazy(() => EnumSubscriptionStatusFieldUpdateOperationsInputSchema) ]).optional(),
  startDate: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  endDate: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  cancelledAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  paymentId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  paymentMethod: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  amount: z.union([ z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  autoRenew: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  nextBillingDate: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  user: z.lazy(() => UserUpdateOneRequiredWithoutSubscriptionsNestedInputSchema).optional()
}).strict();

export const UserSubscriptionUncheckedUpdateWithoutPlanInputSchema: z.ZodType<Prisma.UserSubscriptionUncheckedUpdateWithoutPlanInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => SubscriptionStatusSchema),z.lazy(() => EnumSubscriptionStatusFieldUpdateOperationsInputSchema) ]).optional(),
  startDate: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  endDate: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  cancelledAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  paymentId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  paymentMethod: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  amount: z.union([ z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  autoRenew: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  nextBillingDate: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const UserSubscriptionUncheckedUpdateManyWithoutPlanInputSchema: z.ZodType<Prisma.UserSubscriptionUncheckedUpdateManyWithoutPlanInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => SubscriptionStatusSchema),z.lazy(() => EnumSubscriptionStatusFieldUpdateOperationsInputSchema) ]).optional(),
  startDate: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  endDate: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  cancelledAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  paymentId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  paymentMethod: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  amount: z.union([ z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  autoRenew: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  nextBillingDate: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const BlogPostUpdateWithoutCategoriesInputSchema: z.ZodType<Prisma.BlogPostUpdateWithoutCategoriesInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  slug: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  title: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  excerpt: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  content: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  image: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  accessLevel: z.union([ z.lazy(() => AccessLevelSchema),z.lazy(() => EnumAccessLevelFieldUpdateOperationsInputSchema) ]).optional(),
  previewContent: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  tags: z.union([ z.lazy(() => BlogPostUpdatetagsInputSchema),z.string().array() ]).optional(),
  published: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  publishedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  viewCount: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  author: z.lazy(() => UserUpdateOneRequiredWithoutBlogPostsNestedInputSchema).optional()
}).strict();

export const BlogPostUncheckedUpdateWithoutCategoriesInputSchema: z.ZodType<Prisma.BlogPostUncheckedUpdateWithoutCategoriesInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  slug: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  title: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  excerpt: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  content: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  image: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  authorId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  accessLevel: z.union([ z.lazy(() => AccessLevelSchema),z.lazy(() => EnumAccessLevelFieldUpdateOperationsInputSchema) ]).optional(),
  previewContent: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  tags: z.union([ z.lazy(() => BlogPostUpdatetagsInputSchema),z.string().array() ]).optional(),
  published: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  publishedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  viewCount: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const BlogPostUncheckedUpdateManyWithoutCategoriesInputSchema: z.ZodType<Prisma.BlogPostUncheckedUpdateManyWithoutCategoriesInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  slug: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  title: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  excerpt: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  content: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  image: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  authorId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  accessLevel: z.union([ z.lazy(() => AccessLevelSchema),z.lazy(() => EnumAccessLevelFieldUpdateOperationsInputSchema) ]).optional(),
  previewContent: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  tags: z.union([ z.lazy(() => BlogPostUpdatetagsInputSchema),z.string().array() ]).optional(),
  published: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  publishedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  viewCount: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

/////////////////////////////////////////
// ARGS
/////////////////////////////////////////

export const UserFindFirstArgsSchema: z.ZodType<Omit<Prisma.UserFindFirstArgs, "select" | "include">> = z.object({
  where: UserWhereInputSchema.optional(),
  orderBy: z.union([ UserOrderByWithRelationInputSchema.array(),UserOrderByWithRelationInputSchema ]).optional(),
  cursor: UserWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ UserScalarFieldEnumSchema,UserScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const UserFindFirstOrThrowArgsSchema: z.ZodType<Omit<Prisma.UserFindFirstOrThrowArgs, "select" | "include">> = z.object({
  where: UserWhereInputSchema.optional(),
  orderBy: z.union([ UserOrderByWithRelationInputSchema.array(),UserOrderByWithRelationInputSchema ]).optional(),
  cursor: UserWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ UserScalarFieldEnumSchema,UserScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const UserFindManyArgsSchema: z.ZodType<Omit<Prisma.UserFindManyArgs, "select" | "include">> = z.object({
  where: UserWhereInputSchema.optional(),
  orderBy: z.union([ UserOrderByWithRelationInputSchema.array(),UserOrderByWithRelationInputSchema ]).optional(),
  cursor: UserWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ UserScalarFieldEnumSchema,UserScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const UserAggregateArgsSchema: z.ZodType<Prisma.UserAggregateArgs> = z.object({
  where: UserWhereInputSchema.optional(),
  orderBy: z.union([ UserOrderByWithRelationInputSchema.array(),UserOrderByWithRelationInputSchema ]).optional(),
  cursor: UserWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const UserGroupByArgsSchema: z.ZodType<Prisma.UserGroupByArgs> = z.object({
  where: UserWhereInputSchema.optional(),
  orderBy: z.union([ UserOrderByWithAggregationInputSchema.array(),UserOrderByWithAggregationInputSchema ]).optional(),
  by: UserScalarFieldEnumSchema.array(),
  having: UserScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const UserFindUniqueArgsSchema: z.ZodType<Omit<Prisma.UserFindUniqueArgs, "select" | "include">> = z.object({
  where: UserWhereUniqueInputSchema,
}).strict() ;

export const UserFindUniqueOrThrowArgsSchema: z.ZodType<Omit<Prisma.UserFindUniqueOrThrowArgs, "select" | "include">> = z.object({
  where: UserWhereUniqueInputSchema,
}).strict() ;

export const SessionFindFirstArgsSchema: z.ZodType<Omit<Prisma.SessionFindFirstArgs, "select" | "include">> = z.object({
  where: SessionWhereInputSchema.optional(),
  orderBy: z.union([ SessionOrderByWithRelationInputSchema.array(),SessionOrderByWithRelationInputSchema ]).optional(),
  cursor: SessionWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ SessionScalarFieldEnumSchema,SessionScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const SessionFindFirstOrThrowArgsSchema: z.ZodType<Omit<Prisma.SessionFindFirstOrThrowArgs, "select" | "include">> = z.object({
  where: SessionWhereInputSchema.optional(),
  orderBy: z.union([ SessionOrderByWithRelationInputSchema.array(),SessionOrderByWithRelationInputSchema ]).optional(),
  cursor: SessionWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ SessionScalarFieldEnumSchema,SessionScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const SessionFindManyArgsSchema: z.ZodType<Omit<Prisma.SessionFindManyArgs, "select" | "include">> = z.object({
  where: SessionWhereInputSchema.optional(),
  orderBy: z.union([ SessionOrderByWithRelationInputSchema.array(),SessionOrderByWithRelationInputSchema ]).optional(),
  cursor: SessionWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ SessionScalarFieldEnumSchema,SessionScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const SessionAggregateArgsSchema: z.ZodType<Prisma.SessionAggregateArgs> = z.object({
  where: SessionWhereInputSchema.optional(),
  orderBy: z.union([ SessionOrderByWithRelationInputSchema.array(),SessionOrderByWithRelationInputSchema ]).optional(),
  cursor: SessionWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const SessionGroupByArgsSchema: z.ZodType<Prisma.SessionGroupByArgs> = z.object({
  where: SessionWhereInputSchema.optional(),
  orderBy: z.union([ SessionOrderByWithAggregationInputSchema.array(),SessionOrderByWithAggregationInputSchema ]).optional(),
  by: SessionScalarFieldEnumSchema.array(),
  having: SessionScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const SessionFindUniqueArgsSchema: z.ZodType<Omit<Prisma.SessionFindUniqueArgs, "select" | "include">> = z.object({
  where: SessionWhereUniqueInputSchema,
}).strict() ;

export const SessionFindUniqueOrThrowArgsSchema: z.ZodType<Omit<Prisma.SessionFindUniqueOrThrowArgs, "select" | "include">> = z.object({
  where: SessionWhereUniqueInputSchema,
}).strict() ;

export const AccountFindFirstArgsSchema: z.ZodType<Omit<Prisma.AccountFindFirstArgs, "select" | "include">> = z.object({
  where: AccountWhereInputSchema.optional(),
  orderBy: z.union([ AccountOrderByWithRelationInputSchema.array(),AccountOrderByWithRelationInputSchema ]).optional(),
  cursor: AccountWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ AccountScalarFieldEnumSchema,AccountScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const AccountFindFirstOrThrowArgsSchema: z.ZodType<Omit<Prisma.AccountFindFirstOrThrowArgs, "select" | "include">> = z.object({
  where: AccountWhereInputSchema.optional(),
  orderBy: z.union([ AccountOrderByWithRelationInputSchema.array(),AccountOrderByWithRelationInputSchema ]).optional(),
  cursor: AccountWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ AccountScalarFieldEnumSchema,AccountScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const AccountFindManyArgsSchema: z.ZodType<Omit<Prisma.AccountFindManyArgs, "select" | "include">> = z.object({
  where: AccountWhereInputSchema.optional(),
  orderBy: z.union([ AccountOrderByWithRelationInputSchema.array(),AccountOrderByWithRelationInputSchema ]).optional(),
  cursor: AccountWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ AccountScalarFieldEnumSchema,AccountScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const AccountAggregateArgsSchema: z.ZodType<Prisma.AccountAggregateArgs> = z.object({
  where: AccountWhereInputSchema.optional(),
  orderBy: z.union([ AccountOrderByWithRelationInputSchema.array(),AccountOrderByWithRelationInputSchema ]).optional(),
  cursor: AccountWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const AccountGroupByArgsSchema: z.ZodType<Prisma.AccountGroupByArgs> = z.object({
  where: AccountWhereInputSchema.optional(),
  orderBy: z.union([ AccountOrderByWithAggregationInputSchema.array(),AccountOrderByWithAggregationInputSchema ]).optional(),
  by: AccountScalarFieldEnumSchema.array(),
  having: AccountScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const AccountFindUniqueArgsSchema: z.ZodType<Omit<Prisma.AccountFindUniqueArgs, "select" | "include">> = z.object({
  where: AccountWhereUniqueInputSchema,
}).strict() ;

export const AccountFindUniqueOrThrowArgsSchema: z.ZodType<Omit<Prisma.AccountFindUniqueOrThrowArgs, "select" | "include">> = z.object({
  where: AccountWhereUniqueInputSchema,
}).strict() ;

export const VerificationFindFirstArgsSchema: z.ZodType<Omit<Prisma.VerificationFindFirstArgs, "select">> = z.object({
  where: VerificationWhereInputSchema.optional(),
  orderBy: z.union([ VerificationOrderByWithRelationInputSchema.array(),VerificationOrderByWithRelationInputSchema ]).optional(),
  cursor: VerificationWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ VerificationScalarFieldEnumSchema,VerificationScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const VerificationFindFirstOrThrowArgsSchema: z.ZodType<Omit<Prisma.VerificationFindFirstOrThrowArgs, "select">> = z.object({
  where: VerificationWhereInputSchema.optional(),
  orderBy: z.union([ VerificationOrderByWithRelationInputSchema.array(),VerificationOrderByWithRelationInputSchema ]).optional(),
  cursor: VerificationWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ VerificationScalarFieldEnumSchema,VerificationScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const VerificationFindManyArgsSchema: z.ZodType<Omit<Prisma.VerificationFindManyArgs, "select">> = z.object({
  where: VerificationWhereInputSchema.optional(),
  orderBy: z.union([ VerificationOrderByWithRelationInputSchema.array(),VerificationOrderByWithRelationInputSchema ]).optional(),
  cursor: VerificationWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ VerificationScalarFieldEnumSchema,VerificationScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const VerificationAggregateArgsSchema: z.ZodType<Prisma.VerificationAggregateArgs> = z.object({
  where: VerificationWhereInputSchema.optional(),
  orderBy: z.union([ VerificationOrderByWithRelationInputSchema.array(),VerificationOrderByWithRelationInputSchema ]).optional(),
  cursor: VerificationWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const VerificationGroupByArgsSchema: z.ZodType<Prisma.VerificationGroupByArgs> = z.object({
  where: VerificationWhereInputSchema.optional(),
  orderBy: z.union([ VerificationOrderByWithAggregationInputSchema.array(),VerificationOrderByWithAggregationInputSchema ]).optional(),
  by: VerificationScalarFieldEnumSchema.array(),
  having: VerificationScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const VerificationFindUniqueArgsSchema: z.ZodType<Omit<Prisma.VerificationFindUniqueArgs, "select">> = z.object({
  where: VerificationWhereUniqueInputSchema,
}).strict() ;

export const VerificationFindUniqueOrThrowArgsSchema: z.ZodType<Omit<Prisma.VerificationFindUniqueOrThrowArgs, "select">> = z.object({
  where: VerificationWhereUniqueInputSchema,
}).strict() ;

export const PasskeyFindFirstArgsSchema: z.ZodType<Omit<Prisma.PasskeyFindFirstArgs, "select" | "include">> = z.object({
  where: PasskeyWhereInputSchema.optional(),
  orderBy: z.union([ PasskeyOrderByWithRelationInputSchema.array(),PasskeyOrderByWithRelationInputSchema ]).optional(),
  cursor: PasskeyWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ PasskeyScalarFieldEnumSchema,PasskeyScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const PasskeyFindFirstOrThrowArgsSchema: z.ZodType<Omit<Prisma.PasskeyFindFirstOrThrowArgs, "select" | "include">> = z.object({
  where: PasskeyWhereInputSchema.optional(),
  orderBy: z.union([ PasskeyOrderByWithRelationInputSchema.array(),PasskeyOrderByWithRelationInputSchema ]).optional(),
  cursor: PasskeyWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ PasskeyScalarFieldEnumSchema,PasskeyScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const PasskeyFindManyArgsSchema: z.ZodType<Omit<Prisma.PasskeyFindManyArgs, "select" | "include">> = z.object({
  where: PasskeyWhereInputSchema.optional(),
  orderBy: z.union([ PasskeyOrderByWithRelationInputSchema.array(),PasskeyOrderByWithRelationInputSchema ]).optional(),
  cursor: PasskeyWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ PasskeyScalarFieldEnumSchema,PasskeyScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const PasskeyAggregateArgsSchema: z.ZodType<Prisma.PasskeyAggregateArgs> = z.object({
  where: PasskeyWhereInputSchema.optional(),
  orderBy: z.union([ PasskeyOrderByWithRelationInputSchema.array(),PasskeyOrderByWithRelationInputSchema ]).optional(),
  cursor: PasskeyWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const PasskeyGroupByArgsSchema: z.ZodType<Prisma.PasskeyGroupByArgs> = z.object({
  where: PasskeyWhereInputSchema.optional(),
  orderBy: z.union([ PasskeyOrderByWithAggregationInputSchema.array(),PasskeyOrderByWithAggregationInputSchema ]).optional(),
  by: PasskeyScalarFieldEnumSchema.array(),
  having: PasskeyScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const PasskeyFindUniqueArgsSchema: z.ZodType<Omit<Prisma.PasskeyFindUniqueArgs, "select" | "include">> = z.object({
  where: PasskeyWhereUniqueInputSchema,
}).strict() ;

export const PasskeyFindUniqueOrThrowArgsSchema: z.ZodType<Omit<Prisma.PasskeyFindUniqueOrThrowArgs, "select" | "include">> = z.object({
  where: PasskeyWhereUniqueInputSchema,
}).strict() ;

export const OrganizationFindFirstArgsSchema: z.ZodType<Omit<Prisma.OrganizationFindFirstArgs, "select" | "include">> = z.object({
  where: OrganizationWhereInputSchema.optional(),
  orderBy: z.union([ OrganizationOrderByWithRelationInputSchema.array(),OrganizationOrderByWithRelationInputSchema ]).optional(),
  cursor: OrganizationWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ OrganizationScalarFieldEnumSchema,OrganizationScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const OrganizationFindFirstOrThrowArgsSchema: z.ZodType<Omit<Prisma.OrganizationFindFirstOrThrowArgs, "select" | "include">> = z.object({
  where: OrganizationWhereInputSchema.optional(),
  orderBy: z.union([ OrganizationOrderByWithRelationInputSchema.array(),OrganizationOrderByWithRelationInputSchema ]).optional(),
  cursor: OrganizationWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ OrganizationScalarFieldEnumSchema,OrganizationScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const OrganizationFindManyArgsSchema: z.ZodType<Omit<Prisma.OrganizationFindManyArgs, "select" | "include">> = z.object({
  where: OrganizationWhereInputSchema.optional(),
  orderBy: z.union([ OrganizationOrderByWithRelationInputSchema.array(),OrganizationOrderByWithRelationInputSchema ]).optional(),
  cursor: OrganizationWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ OrganizationScalarFieldEnumSchema,OrganizationScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const OrganizationAggregateArgsSchema: z.ZodType<Prisma.OrganizationAggregateArgs> = z.object({
  where: OrganizationWhereInputSchema.optional(),
  orderBy: z.union([ OrganizationOrderByWithRelationInputSchema.array(),OrganizationOrderByWithRelationInputSchema ]).optional(),
  cursor: OrganizationWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const OrganizationGroupByArgsSchema: z.ZodType<Prisma.OrganizationGroupByArgs> = z.object({
  where: OrganizationWhereInputSchema.optional(),
  orderBy: z.union([ OrganizationOrderByWithAggregationInputSchema.array(),OrganizationOrderByWithAggregationInputSchema ]).optional(),
  by: OrganizationScalarFieldEnumSchema.array(),
  having: OrganizationScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const OrganizationFindUniqueArgsSchema: z.ZodType<Omit<Prisma.OrganizationFindUniqueArgs, "select" | "include">> = z.object({
  where: OrganizationWhereUniqueInputSchema,
}).strict() ;

export const OrganizationFindUniqueOrThrowArgsSchema: z.ZodType<Omit<Prisma.OrganizationFindUniqueOrThrowArgs, "select" | "include">> = z.object({
  where: OrganizationWhereUniqueInputSchema,
}).strict() ;

export const MemberFindFirstArgsSchema: z.ZodType<Omit<Prisma.MemberFindFirstArgs, "select" | "include">> = z.object({
  where: MemberWhereInputSchema.optional(),
  orderBy: z.union([ MemberOrderByWithRelationInputSchema.array(),MemberOrderByWithRelationInputSchema ]).optional(),
  cursor: MemberWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ MemberScalarFieldEnumSchema,MemberScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const MemberFindFirstOrThrowArgsSchema: z.ZodType<Omit<Prisma.MemberFindFirstOrThrowArgs, "select" | "include">> = z.object({
  where: MemberWhereInputSchema.optional(),
  orderBy: z.union([ MemberOrderByWithRelationInputSchema.array(),MemberOrderByWithRelationInputSchema ]).optional(),
  cursor: MemberWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ MemberScalarFieldEnumSchema,MemberScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const MemberFindManyArgsSchema: z.ZodType<Omit<Prisma.MemberFindManyArgs, "select" | "include">> = z.object({
  where: MemberWhereInputSchema.optional(),
  orderBy: z.union([ MemberOrderByWithRelationInputSchema.array(),MemberOrderByWithRelationInputSchema ]).optional(),
  cursor: MemberWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ MemberScalarFieldEnumSchema,MemberScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const MemberAggregateArgsSchema: z.ZodType<Prisma.MemberAggregateArgs> = z.object({
  where: MemberWhereInputSchema.optional(),
  orderBy: z.union([ MemberOrderByWithRelationInputSchema.array(),MemberOrderByWithRelationInputSchema ]).optional(),
  cursor: MemberWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const MemberGroupByArgsSchema: z.ZodType<Prisma.MemberGroupByArgs> = z.object({
  where: MemberWhereInputSchema.optional(),
  orderBy: z.union([ MemberOrderByWithAggregationInputSchema.array(),MemberOrderByWithAggregationInputSchema ]).optional(),
  by: MemberScalarFieldEnumSchema.array(),
  having: MemberScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const MemberFindUniqueArgsSchema: z.ZodType<Omit<Prisma.MemberFindUniqueArgs, "select" | "include">> = z.object({
  where: MemberWhereUniqueInputSchema,
}).strict() ;

export const MemberFindUniqueOrThrowArgsSchema: z.ZodType<Omit<Prisma.MemberFindUniqueOrThrowArgs, "select" | "include">> = z.object({
  where: MemberWhereUniqueInputSchema,
}).strict() ;

export const InvitationFindFirstArgsSchema: z.ZodType<Omit<Prisma.InvitationFindFirstArgs, "select" | "include">> = z.object({
  where: InvitationWhereInputSchema.optional(),
  orderBy: z.union([ InvitationOrderByWithRelationInputSchema.array(),InvitationOrderByWithRelationInputSchema ]).optional(),
  cursor: InvitationWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ InvitationScalarFieldEnumSchema,InvitationScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const InvitationFindFirstOrThrowArgsSchema: z.ZodType<Omit<Prisma.InvitationFindFirstOrThrowArgs, "select" | "include">> = z.object({
  where: InvitationWhereInputSchema.optional(),
  orderBy: z.union([ InvitationOrderByWithRelationInputSchema.array(),InvitationOrderByWithRelationInputSchema ]).optional(),
  cursor: InvitationWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ InvitationScalarFieldEnumSchema,InvitationScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const InvitationFindManyArgsSchema: z.ZodType<Omit<Prisma.InvitationFindManyArgs, "select" | "include">> = z.object({
  where: InvitationWhereInputSchema.optional(),
  orderBy: z.union([ InvitationOrderByWithRelationInputSchema.array(),InvitationOrderByWithRelationInputSchema ]).optional(),
  cursor: InvitationWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ InvitationScalarFieldEnumSchema,InvitationScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const InvitationAggregateArgsSchema: z.ZodType<Prisma.InvitationAggregateArgs> = z.object({
  where: InvitationWhereInputSchema.optional(),
  orderBy: z.union([ InvitationOrderByWithRelationInputSchema.array(),InvitationOrderByWithRelationInputSchema ]).optional(),
  cursor: InvitationWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const InvitationGroupByArgsSchema: z.ZodType<Prisma.InvitationGroupByArgs> = z.object({
  where: InvitationWhereInputSchema.optional(),
  orderBy: z.union([ InvitationOrderByWithAggregationInputSchema.array(),InvitationOrderByWithAggregationInputSchema ]).optional(),
  by: InvitationScalarFieldEnumSchema.array(),
  having: InvitationScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const InvitationFindUniqueArgsSchema: z.ZodType<Omit<Prisma.InvitationFindUniqueArgs, "select" | "include">> = z.object({
  where: InvitationWhereUniqueInputSchema,
}).strict() ;

export const InvitationFindUniqueOrThrowArgsSchema: z.ZodType<Omit<Prisma.InvitationFindUniqueOrThrowArgs, "select" | "include">> = z.object({
  where: InvitationWhereUniqueInputSchema,
}).strict() ;

export const PurchaseFindFirstArgsSchema: z.ZodType<Omit<Prisma.PurchaseFindFirstArgs, "select" | "include">> = z.object({
  where: PurchaseWhereInputSchema.optional(),
  orderBy: z.union([ PurchaseOrderByWithRelationInputSchema.array(),PurchaseOrderByWithRelationInputSchema ]).optional(),
  cursor: PurchaseWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ PurchaseScalarFieldEnumSchema,PurchaseScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const PurchaseFindFirstOrThrowArgsSchema: z.ZodType<Omit<Prisma.PurchaseFindFirstOrThrowArgs, "select" | "include">> = z.object({
  where: PurchaseWhereInputSchema.optional(),
  orderBy: z.union([ PurchaseOrderByWithRelationInputSchema.array(),PurchaseOrderByWithRelationInputSchema ]).optional(),
  cursor: PurchaseWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ PurchaseScalarFieldEnumSchema,PurchaseScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const PurchaseFindManyArgsSchema: z.ZodType<Omit<Prisma.PurchaseFindManyArgs, "select" | "include">> = z.object({
  where: PurchaseWhereInputSchema.optional(),
  orderBy: z.union([ PurchaseOrderByWithRelationInputSchema.array(),PurchaseOrderByWithRelationInputSchema ]).optional(),
  cursor: PurchaseWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ PurchaseScalarFieldEnumSchema,PurchaseScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const PurchaseAggregateArgsSchema: z.ZodType<Prisma.PurchaseAggregateArgs> = z.object({
  where: PurchaseWhereInputSchema.optional(),
  orderBy: z.union([ PurchaseOrderByWithRelationInputSchema.array(),PurchaseOrderByWithRelationInputSchema ]).optional(),
  cursor: PurchaseWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const PurchaseGroupByArgsSchema: z.ZodType<Prisma.PurchaseGroupByArgs> = z.object({
  where: PurchaseWhereInputSchema.optional(),
  orderBy: z.union([ PurchaseOrderByWithAggregationInputSchema.array(),PurchaseOrderByWithAggregationInputSchema ]).optional(),
  by: PurchaseScalarFieldEnumSchema.array(),
  having: PurchaseScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const PurchaseFindUniqueArgsSchema: z.ZodType<Omit<Prisma.PurchaseFindUniqueArgs, "select" | "include">> = z.object({
  where: PurchaseWhereUniqueInputSchema,
}).strict() ;

export const PurchaseFindUniqueOrThrowArgsSchema: z.ZodType<Omit<Prisma.PurchaseFindUniqueOrThrowArgs, "select" | "include">> = z.object({
  where: PurchaseWhereUniqueInputSchema,
}).strict() ;

export const AiChatFindFirstArgsSchema: z.ZodType<Omit<Prisma.AiChatFindFirstArgs, "select" | "include">> = z.object({
  where: AiChatWhereInputSchema.optional(),
  orderBy: z.union([ AiChatOrderByWithRelationInputSchema.array(),AiChatOrderByWithRelationInputSchema ]).optional(),
  cursor: AiChatWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ AiChatScalarFieldEnumSchema,AiChatScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const AiChatFindFirstOrThrowArgsSchema: z.ZodType<Omit<Prisma.AiChatFindFirstOrThrowArgs, "select" | "include">> = z.object({
  where: AiChatWhereInputSchema.optional(),
  orderBy: z.union([ AiChatOrderByWithRelationInputSchema.array(),AiChatOrderByWithRelationInputSchema ]).optional(),
  cursor: AiChatWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ AiChatScalarFieldEnumSchema,AiChatScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const AiChatFindManyArgsSchema: z.ZodType<Omit<Prisma.AiChatFindManyArgs, "select" | "include">> = z.object({
  where: AiChatWhereInputSchema.optional(),
  orderBy: z.union([ AiChatOrderByWithRelationInputSchema.array(),AiChatOrderByWithRelationInputSchema ]).optional(),
  cursor: AiChatWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ AiChatScalarFieldEnumSchema,AiChatScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const AiChatAggregateArgsSchema: z.ZodType<Prisma.AiChatAggregateArgs> = z.object({
  where: AiChatWhereInputSchema.optional(),
  orderBy: z.union([ AiChatOrderByWithRelationInputSchema.array(),AiChatOrderByWithRelationInputSchema ]).optional(),
  cursor: AiChatWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const AiChatGroupByArgsSchema: z.ZodType<Prisma.AiChatGroupByArgs> = z.object({
  where: AiChatWhereInputSchema.optional(),
  orderBy: z.union([ AiChatOrderByWithAggregationInputSchema.array(),AiChatOrderByWithAggregationInputSchema ]).optional(),
  by: AiChatScalarFieldEnumSchema.array(),
  having: AiChatScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const AiChatFindUniqueArgsSchema: z.ZodType<Omit<Prisma.AiChatFindUniqueArgs, "select" | "include">> = z.object({
  where: AiChatWhereUniqueInputSchema,
}).strict() ;

export const AiChatFindUniqueOrThrowArgsSchema: z.ZodType<Omit<Prisma.AiChatFindUniqueOrThrowArgs, "select" | "include">> = z.object({
  where: AiChatWhereUniqueInputSchema,
}).strict() ;

export const BlogPostFindFirstArgsSchema: z.ZodType<Omit<Prisma.BlogPostFindFirstArgs, "select" | "include">> = z.object({
  where: BlogPostWhereInputSchema.optional(),
  orderBy: z.union([ BlogPostOrderByWithRelationInputSchema.array(),BlogPostOrderByWithRelationInputSchema ]).optional(),
  cursor: BlogPostWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ BlogPostScalarFieldEnumSchema,BlogPostScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const BlogPostFindFirstOrThrowArgsSchema: z.ZodType<Omit<Prisma.BlogPostFindFirstOrThrowArgs, "select" | "include">> = z.object({
  where: BlogPostWhereInputSchema.optional(),
  orderBy: z.union([ BlogPostOrderByWithRelationInputSchema.array(),BlogPostOrderByWithRelationInputSchema ]).optional(),
  cursor: BlogPostWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ BlogPostScalarFieldEnumSchema,BlogPostScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const BlogPostFindManyArgsSchema: z.ZodType<Omit<Prisma.BlogPostFindManyArgs, "select" | "include">> = z.object({
  where: BlogPostWhereInputSchema.optional(),
  orderBy: z.union([ BlogPostOrderByWithRelationInputSchema.array(),BlogPostOrderByWithRelationInputSchema ]).optional(),
  cursor: BlogPostWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ BlogPostScalarFieldEnumSchema,BlogPostScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const BlogPostAggregateArgsSchema: z.ZodType<Prisma.BlogPostAggregateArgs> = z.object({
  where: BlogPostWhereInputSchema.optional(),
  orderBy: z.union([ BlogPostOrderByWithRelationInputSchema.array(),BlogPostOrderByWithRelationInputSchema ]).optional(),
  cursor: BlogPostWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const BlogPostGroupByArgsSchema: z.ZodType<Prisma.BlogPostGroupByArgs> = z.object({
  where: BlogPostWhereInputSchema.optional(),
  orderBy: z.union([ BlogPostOrderByWithAggregationInputSchema.array(),BlogPostOrderByWithAggregationInputSchema ]).optional(),
  by: BlogPostScalarFieldEnumSchema.array(),
  having: BlogPostScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const BlogPostFindUniqueArgsSchema: z.ZodType<Omit<Prisma.BlogPostFindUniqueArgs, "select" | "include">> = z.object({
  where: BlogPostWhereUniqueInputSchema,
}).strict() ;

export const BlogPostFindUniqueOrThrowArgsSchema: z.ZodType<Omit<Prisma.BlogPostFindUniqueOrThrowArgs, "select" | "include">> = z.object({
  where: BlogPostWhereUniqueInputSchema,
}).strict() ;

export const SubscriptionPlanFindFirstArgsSchema: z.ZodType<Omit<Prisma.SubscriptionPlanFindFirstArgs, "select" | "include">> = z.object({
  where: SubscriptionPlanWhereInputSchema.optional(),
  orderBy: z.union([ SubscriptionPlanOrderByWithRelationInputSchema.array(),SubscriptionPlanOrderByWithRelationInputSchema ]).optional(),
  cursor: SubscriptionPlanWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ SubscriptionPlanScalarFieldEnumSchema,SubscriptionPlanScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const SubscriptionPlanFindFirstOrThrowArgsSchema: z.ZodType<Omit<Prisma.SubscriptionPlanFindFirstOrThrowArgs, "select" | "include">> = z.object({
  where: SubscriptionPlanWhereInputSchema.optional(),
  orderBy: z.union([ SubscriptionPlanOrderByWithRelationInputSchema.array(),SubscriptionPlanOrderByWithRelationInputSchema ]).optional(),
  cursor: SubscriptionPlanWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ SubscriptionPlanScalarFieldEnumSchema,SubscriptionPlanScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const SubscriptionPlanFindManyArgsSchema: z.ZodType<Omit<Prisma.SubscriptionPlanFindManyArgs, "select" | "include">> = z.object({
  where: SubscriptionPlanWhereInputSchema.optional(),
  orderBy: z.union([ SubscriptionPlanOrderByWithRelationInputSchema.array(),SubscriptionPlanOrderByWithRelationInputSchema ]).optional(),
  cursor: SubscriptionPlanWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ SubscriptionPlanScalarFieldEnumSchema,SubscriptionPlanScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const SubscriptionPlanAggregateArgsSchema: z.ZodType<Prisma.SubscriptionPlanAggregateArgs> = z.object({
  where: SubscriptionPlanWhereInputSchema.optional(),
  orderBy: z.union([ SubscriptionPlanOrderByWithRelationInputSchema.array(),SubscriptionPlanOrderByWithRelationInputSchema ]).optional(),
  cursor: SubscriptionPlanWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const SubscriptionPlanGroupByArgsSchema: z.ZodType<Prisma.SubscriptionPlanGroupByArgs> = z.object({
  where: SubscriptionPlanWhereInputSchema.optional(),
  orderBy: z.union([ SubscriptionPlanOrderByWithAggregationInputSchema.array(),SubscriptionPlanOrderByWithAggregationInputSchema ]).optional(),
  by: SubscriptionPlanScalarFieldEnumSchema.array(),
  having: SubscriptionPlanScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const SubscriptionPlanFindUniqueArgsSchema: z.ZodType<Omit<Prisma.SubscriptionPlanFindUniqueArgs, "select" | "include">> = z.object({
  where: SubscriptionPlanWhereUniqueInputSchema,
}).strict() ;

export const SubscriptionPlanFindUniqueOrThrowArgsSchema: z.ZodType<Omit<Prisma.SubscriptionPlanFindUniqueOrThrowArgs, "select" | "include">> = z.object({
  where: SubscriptionPlanWhereUniqueInputSchema,
}).strict() ;

export const UserSubscriptionFindFirstArgsSchema: z.ZodType<Omit<Prisma.UserSubscriptionFindFirstArgs, "select" | "include">> = z.object({
  where: UserSubscriptionWhereInputSchema.optional(),
  orderBy: z.union([ UserSubscriptionOrderByWithRelationInputSchema.array(),UserSubscriptionOrderByWithRelationInputSchema ]).optional(),
  cursor: UserSubscriptionWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ UserSubscriptionScalarFieldEnumSchema,UserSubscriptionScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const UserSubscriptionFindFirstOrThrowArgsSchema: z.ZodType<Omit<Prisma.UserSubscriptionFindFirstOrThrowArgs, "select" | "include">> = z.object({
  where: UserSubscriptionWhereInputSchema.optional(),
  orderBy: z.union([ UserSubscriptionOrderByWithRelationInputSchema.array(),UserSubscriptionOrderByWithRelationInputSchema ]).optional(),
  cursor: UserSubscriptionWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ UserSubscriptionScalarFieldEnumSchema,UserSubscriptionScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const UserSubscriptionFindManyArgsSchema: z.ZodType<Omit<Prisma.UserSubscriptionFindManyArgs, "select" | "include">> = z.object({
  where: UserSubscriptionWhereInputSchema.optional(),
  orderBy: z.union([ UserSubscriptionOrderByWithRelationInputSchema.array(),UserSubscriptionOrderByWithRelationInputSchema ]).optional(),
  cursor: UserSubscriptionWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ UserSubscriptionScalarFieldEnumSchema,UserSubscriptionScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const UserSubscriptionAggregateArgsSchema: z.ZodType<Prisma.UserSubscriptionAggregateArgs> = z.object({
  where: UserSubscriptionWhereInputSchema.optional(),
  orderBy: z.union([ UserSubscriptionOrderByWithRelationInputSchema.array(),UserSubscriptionOrderByWithRelationInputSchema ]).optional(),
  cursor: UserSubscriptionWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const UserSubscriptionGroupByArgsSchema: z.ZodType<Prisma.UserSubscriptionGroupByArgs> = z.object({
  where: UserSubscriptionWhereInputSchema.optional(),
  orderBy: z.union([ UserSubscriptionOrderByWithAggregationInputSchema.array(),UserSubscriptionOrderByWithAggregationInputSchema ]).optional(),
  by: UserSubscriptionScalarFieldEnumSchema.array(),
  having: UserSubscriptionScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const UserSubscriptionFindUniqueArgsSchema: z.ZodType<Omit<Prisma.UserSubscriptionFindUniqueArgs, "select" | "include">> = z.object({
  where: UserSubscriptionWhereUniqueInputSchema,
}).strict() ;

export const UserSubscriptionFindUniqueOrThrowArgsSchema: z.ZodType<Omit<Prisma.UserSubscriptionFindUniqueOrThrowArgs, "select" | "include">> = z.object({
  where: UserSubscriptionWhereUniqueInputSchema,
}).strict() ;

export const BlogCategoryFindFirstArgsSchema: z.ZodType<Omit<Prisma.BlogCategoryFindFirstArgs, "select" | "include">> = z.object({
  where: BlogCategoryWhereInputSchema.optional(),
  orderBy: z.union([ BlogCategoryOrderByWithRelationInputSchema.array(),BlogCategoryOrderByWithRelationInputSchema ]).optional(),
  cursor: BlogCategoryWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ BlogCategoryScalarFieldEnumSchema,BlogCategoryScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const BlogCategoryFindFirstOrThrowArgsSchema: z.ZodType<Omit<Prisma.BlogCategoryFindFirstOrThrowArgs, "select" | "include">> = z.object({
  where: BlogCategoryWhereInputSchema.optional(),
  orderBy: z.union([ BlogCategoryOrderByWithRelationInputSchema.array(),BlogCategoryOrderByWithRelationInputSchema ]).optional(),
  cursor: BlogCategoryWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ BlogCategoryScalarFieldEnumSchema,BlogCategoryScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const BlogCategoryFindManyArgsSchema: z.ZodType<Omit<Prisma.BlogCategoryFindManyArgs, "select" | "include">> = z.object({
  where: BlogCategoryWhereInputSchema.optional(),
  orderBy: z.union([ BlogCategoryOrderByWithRelationInputSchema.array(),BlogCategoryOrderByWithRelationInputSchema ]).optional(),
  cursor: BlogCategoryWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ BlogCategoryScalarFieldEnumSchema,BlogCategoryScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const BlogCategoryAggregateArgsSchema: z.ZodType<Prisma.BlogCategoryAggregateArgs> = z.object({
  where: BlogCategoryWhereInputSchema.optional(),
  orderBy: z.union([ BlogCategoryOrderByWithRelationInputSchema.array(),BlogCategoryOrderByWithRelationInputSchema ]).optional(),
  cursor: BlogCategoryWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const BlogCategoryGroupByArgsSchema: z.ZodType<Prisma.BlogCategoryGroupByArgs> = z.object({
  where: BlogCategoryWhereInputSchema.optional(),
  orderBy: z.union([ BlogCategoryOrderByWithAggregationInputSchema.array(),BlogCategoryOrderByWithAggregationInputSchema ]).optional(),
  by: BlogCategoryScalarFieldEnumSchema.array(),
  having: BlogCategoryScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const BlogCategoryFindUniqueArgsSchema: z.ZodType<Omit<Prisma.BlogCategoryFindUniqueArgs, "select" | "include">> = z.object({
  where: BlogCategoryWhereUniqueInputSchema,
}).strict() ;

export const BlogCategoryFindUniqueOrThrowArgsSchema: z.ZodType<Omit<Prisma.BlogCategoryFindUniqueOrThrowArgs, "select" | "include">> = z.object({
  where: BlogCategoryWhereUniqueInputSchema,
}).strict() ;

export const UserCreateArgsSchema: z.ZodType<Omit<Prisma.UserCreateArgs, "select" | "include">> = z.object({
  data: z.union([ UserCreateInputSchema,UserUncheckedCreateInputSchema ]),
}).strict() ;

export const UserUpsertArgsSchema: z.ZodType<Omit<Prisma.UserUpsertArgs, "select" | "include">> = z.object({
  where: UserWhereUniqueInputSchema,
  create: z.union([ UserCreateInputSchema,UserUncheckedCreateInputSchema ]),
  update: z.union([ UserUpdateInputSchema,UserUncheckedUpdateInputSchema ]),
}).strict() ;

export const UserCreateManyArgsSchema: z.ZodType<Prisma.UserCreateManyArgs> = z.object({
  data: z.union([ UserCreateManyInputSchema,UserCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const UserCreateManyAndReturnArgsSchema: z.ZodType<Prisma.UserCreateManyAndReturnArgs> = z.object({
  data: z.union([ UserCreateManyInputSchema,UserCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const UserDeleteArgsSchema: z.ZodType<Omit<Prisma.UserDeleteArgs, "select" | "include">> = z.object({
  where: UserWhereUniqueInputSchema,
}).strict() ;

export const UserUpdateArgsSchema: z.ZodType<Omit<Prisma.UserUpdateArgs, "select" | "include">> = z.object({
  data: z.union([ UserUpdateInputSchema,UserUncheckedUpdateInputSchema ]),
  where: UserWhereUniqueInputSchema,
}).strict() ;

export const UserUpdateManyArgsSchema: z.ZodType<Prisma.UserUpdateManyArgs> = z.object({
  data: z.union([ UserUpdateManyMutationInputSchema,UserUncheckedUpdateManyInputSchema ]),
  where: UserWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export const UserUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.UserUpdateManyAndReturnArgs> = z.object({
  data: z.union([ UserUpdateManyMutationInputSchema,UserUncheckedUpdateManyInputSchema ]),
  where: UserWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export const UserDeleteManyArgsSchema: z.ZodType<Prisma.UserDeleteManyArgs> = z.object({
  where: UserWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export const SessionCreateArgsSchema: z.ZodType<Omit<Prisma.SessionCreateArgs, "select" | "include">> = z.object({
  data: z.union([ SessionCreateInputSchema,SessionUncheckedCreateInputSchema ]),
}).strict() ;

export const SessionUpsertArgsSchema: z.ZodType<Omit<Prisma.SessionUpsertArgs, "select" | "include">> = z.object({
  where: SessionWhereUniqueInputSchema,
  create: z.union([ SessionCreateInputSchema,SessionUncheckedCreateInputSchema ]),
  update: z.union([ SessionUpdateInputSchema,SessionUncheckedUpdateInputSchema ]),
}).strict() ;

export const SessionCreateManyArgsSchema: z.ZodType<Prisma.SessionCreateManyArgs> = z.object({
  data: z.union([ SessionCreateManyInputSchema,SessionCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const SessionCreateManyAndReturnArgsSchema: z.ZodType<Prisma.SessionCreateManyAndReturnArgs> = z.object({
  data: z.union([ SessionCreateManyInputSchema,SessionCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const SessionDeleteArgsSchema: z.ZodType<Omit<Prisma.SessionDeleteArgs, "select" | "include">> = z.object({
  where: SessionWhereUniqueInputSchema,
}).strict() ;

export const SessionUpdateArgsSchema: z.ZodType<Omit<Prisma.SessionUpdateArgs, "select" | "include">> = z.object({
  data: z.union([ SessionUpdateInputSchema,SessionUncheckedUpdateInputSchema ]),
  where: SessionWhereUniqueInputSchema,
}).strict() ;

export const SessionUpdateManyArgsSchema: z.ZodType<Prisma.SessionUpdateManyArgs> = z.object({
  data: z.union([ SessionUpdateManyMutationInputSchema,SessionUncheckedUpdateManyInputSchema ]),
  where: SessionWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export const SessionUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.SessionUpdateManyAndReturnArgs> = z.object({
  data: z.union([ SessionUpdateManyMutationInputSchema,SessionUncheckedUpdateManyInputSchema ]),
  where: SessionWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export const SessionDeleteManyArgsSchema: z.ZodType<Prisma.SessionDeleteManyArgs> = z.object({
  where: SessionWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export const AccountCreateArgsSchema: z.ZodType<Omit<Prisma.AccountCreateArgs, "select" | "include">> = z.object({
  data: z.union([ AccountCreateInputSchema,AccountUncheckedCreateInputSchema ]),
}).strict() ;

export const AccountUpsertArgsSchema: z.ZodType<Omit<Prisma.AccountUpsertArgs, "select" | "include">> = z.object({
  where: AccountWhereUniqueInputSchema,
  create: z.union([ AccountCreateInputSchema,AccountUncheckedCreateInputSchema ]),
  update: z.union([ AccountUpdateInputSchema,AccountUncheckedUpdateInputSchema ]),
}).strict() ;

export const AccountCreateManyArgsSchema: z.ZodType<Prisma.AccountCreateManyArgs> = z.object({
  data: z.union([ AccountCreateManyInputSchema,AccountCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const AccountCreateManyAndReturnArgsSchema: z.ZodType<Prisma.AccountCreateManyAndReturnArgs> = z.object({
  data: z.union([ AccountCreateManyInputSchema,AccountCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const AccountDeleteArgsSchema: z.ZodType<Omit<Prisma.AccountDeleteArgs, "select" | "include">> = z.object({
  where: AccountWhereUniqueInputSchema,
}).strict() ;

export const AccountUpdateArgsSchema: z.ZodType<Omit<Prisma.AccountUpdateArgs, "select" | "include">> = z.object({
  data: z.union([ AccountUpdateInputSchema,AccountUncheckedUpdateInputSchema ]),
  where: AccountWhereUniqueInputSchema,
}).strict() ;

export const AccountUpdateManyArgsSchema: z.ZodType<Prisma.AccountUpdateManyArgs> = z.object({
  data: z.union([ AccountUpdateManyMutationInputSchema,AccountUncheckedUpdateManyInputSchema ]),
  where: AccountWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export const AccountUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.AccountUpdateManyAndReturnArgs> = z.object({
  data: z.union([ AccountUpdateManyMutationInputSchema,AccountUncheckedUpdateManyInputSchema ]),
  where: AccountWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export const AccountDeleteManyArgsSchema: z.ZodType<Prisma.AccountDeleteManyArgs> = z.object({
  where: AccountWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export const VerificationCreateArgsSchema: z.ZodType<Omit<Prisma.VerificationCreateArgs, "select">> = z.object({
  data: z.union([ VerificationCreateInputSchema,VerificationUncheckedCreateInputSchema ]),
}).strict() ;

export const VerificationUpsertArgsSchema: z.ZodType<Omit<Prisma.VerificationUpsertArgs, "select">> = z.object({
  where: VerificationWhereUniqueInputSchema,
  create: z.union([ VerificationCreateInputSchema,VerificationUncheckedCreateInputSchema ]),
  update: z.union([ VerificationUpdateInputSchema,VerificationUncheckedUpdateInputSchema ]),
}).strict() ;

export const VerificationCreateManyArgsSchema: z.ZodType<Prisma.VerificationCreateManyArgs> = z.object({
  data: z.union([ VerificationCreateManyInputSchema,VerificationCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const VerificationCreateManyAndReturnArgsSchema: z.ZodType<Prisma.VerificationCreateManyAndReturnArgs> = z.object({
  data: z.union([ VerificationCreateManyInputSchema,VerificationCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const VerificationDeleteArgsSchema: z.ZodType<Omit<Prisma.VerificationDeleteArgs, "select">> = z.object({
  where: VerificationWhereUniqueInputSchema,
}).strict() ;

export const VerificationUpdateArgsSchema: z.ZodType<Omit<Prisma.VerificationUpdateArgs, "select">> = z.object({
  data: z.union([ VerificationUpdateInputSchema,VerificationUncheckedUpdateInputSchema ]),
  where: VerificationWhereUniqueInputSchema,
}).strict() ;

export const VerificationUpdateManyArgsSchema: z.ZodType<Prisma.VerificationUpdateManyArgs> = z.object({
  data: z.union([ VerificationUpdateManyMutationInputSchema,VerificationUncheckedUpdateManyInputSchema ]),
  where: VerificationWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export const VerificationUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.VerificationUpdateManyAndReturnArgs> = z.object({
  data: z.union([ VerificationUpdateManyMutationInputSchema,VerificationUncheckedUpdateManyInputSchema ]),
  where: VerificationWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export const VerificationDeleteManyArgsSchema: z.ZodType<Prisma.VerificationDeleteManyArgs> = z.object({
  where: VerificationWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export const PasskeyCreateArgsSchema: z.ZodType<Omit<Prisma.PasskeyCreateArgs, "select" | "include">> = z.object({
  data: z.union([ PasskeyCreateInputSchema,PasskeyUncheckedCreateInputSchema ]),
}).strict() ;

export const PasskeyUpsertArgsSchema: z.ZodType<Omit<Prisma.PasskeyUpsertArgs, "select" | "include">> = z.object({
  where: PasskeyWhereUniqueInputSchema,
  create: z.union([ PasskeyCreateInputSchema,PasskeyUncheckedCreateInputSchema ]),
  update: z.union([ PasskeyUpdateInputSchema,PasskeyUncheckedUpdateInputSchema ]),
}).strict() ;

export const PasskeyCreateManyArgsSchema: z.ZodType<Prisma.PasskeyCreateManyArgs> = z.object({
  data: z.union([ PasskeyCreateManyInputSchema,PasskeyCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const PasskeyCreateManyAndReturnArgsSchema: z.ZodType<Prisma.PasskeyCreateManyAndReturnArgs> = z.object({
  data: z.union([ PasskeyCreateManyInputSchema,PasskeyCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const PasskeyDeleteArgsSchema: z.ZodType<Omit<Prisma.PasskeyDeleteArgs, "select" | "include">> = z.object({
  where: PasskeyWhereUniqueInputSchema,
}).strict() ;

export const PasskeyUpdateArgsSchema: z.ZodType<Omit<Prisma.PasskeyUpdateArgs, "select" | "include">> = z.object({
  data: z.union([ PasskeyUpdateInputSchema,PasskeyUncheckedUpdateInputSchema ]),
  where: PasskeyWhereUniqueInputSchema,
}).strict() ;

export const PasskeyUpdateManyArgsSchema: z.ZodType<Prisma.PasskeyUpdateManyArgs> = z.object({
  data: z.union([ PasskeyUpdateManyMutationInputSchema,PasskeyUncheckedUpdateManyInputSchema ]),
  where: PasskeyWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export const PasskeyUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.PasskeyUpdateManyAndReturnArgs> = z.object({
  data: z.union([ PasskeyUpdateManyMutationInputSchema,PasskeyUncheckedUpdateManyInputSchema ]),
  where: PasskeyWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export const PasskeyDeleteManyArgsSchema: z.ZodType<Prisma.PasskeyDeleteManyArgs> = z.object({
  where: PasskeyWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export const OrganizationCreateArgsSchema: z.ZodType<Omit<Prisma.OrganizationCreateArgs, "select" | "include">> = z.object({
  data: z.union([ OrganizationCreateInputSchema,OrganizationUncheckedCreateInputSchema ]),
}).strict() ;

export const OrganizationUpsertArgsSchema: z.ZodType<Omit<Prisma.OrganizationUpsertArgs, "select" | "include">> = z.object({
  where: OrganizationWhereUniqueInputSchema,
  create: z.union([ OrganizationCreateInputSchema,OrganizationUncheckedCreateInputSchema ]),
  update: z.union([ OrganizationUpdateInputSchema,OrganizationUncheckedUpdateInputSchema ]),
}).strict() ;

export const OrganizationCreateManyArgsSchema: z.ZodType<Prisma.OrganizationCreateManyArgs> = z.object({
  data: z.union([ OrganizationCreateManyInputSchema,OrganizationCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const OrganizationCreateManyAndReturnArgsSchema: z.ZodType<Prisma.OrganizationCreateManyAndReturnArgs> = z.object({
  data: z.union([ OrganizationCreateManyInputSchema,OrganizationCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const OrganizationDeleteArgsSchema: z.ZodType<Omit<Prisma.OrganizationDeleteArgs, "select" | "include">> = z.object({
  where: OrganizationWhereUniqueInputSchema,
}).strict() ;

export const OrganizationUpdateArgsSchema: z.ZodType<Omit<Prisma.OrganizationUpdateArgs, "select" | "include">> = z.object({
  data: z.union([ OrganizationUpdateInputSchema,OrganizationUncheckedUpdateInputSchema ]),
  where: OrganizationWhereUniqueInputSchema,
}).strict() ;

export const OrganizationUpdateManyArgsSchema: z.ZodType<Prisma.OrganizationUpdateManyArgs> = z.object({
  data: z.union([ OrganizationUpdateManyMutationInputSchema,OrganizationUncheckedUpdateManyInputSchema ]),
  where: OrganizationWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export const OrganizationUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.OrganizationUpdateManyAndReturnArgs> = z.object({
  data: z.union([ OrganizationUpdateManyMutationInputSchema,OrganizationUncheckedUpdateManyInputSchema ]),
  where: OrganizationWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export const OrganizationDeleteManyArgsSchema: z.ZodType<Prisma.OrganizationDeleteManyArgs> = z.object({
  where: OrganizationWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export const MemberCreateArgsSchema: z.ZodType<Omit<Prisma.MemberCreateArgs, "select" | "include">> = z.object({
  data: z.union([ MemberCreateInputSchema,MemberUncheckedCreateInputSchema ]),
}).strict() ;

export const MemberUpsertArgsSchema: z.ZodType<Omit<Prisma.MemberUpsertArgs, "select" | "include">> = z.object({
  where: MemberWhereUniqueInputSchema,
  create: z.union([ MemberCreateInputSchema,MemberUncheckedCreateInputSchema ]),
  update: z.union([ MemberUpdateInputSchema,MemberUncheckedUpdateInputSchema ]),
}).strict() ;

export const MemberCreateManyArgsSchema: z.ZodType<Prisma.MemberCreateManyArgs> = z.object({
  data: z.union([ MemberCreateManyInputSchema,MemberCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const MemberCreateManyAndReturnArgsSchema: z.ZodType<Prisma.MemberCreateManyAndReturnArgs> = z.object({
  data: z.union([ MemberCreateManyInputSchema,MemberCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const MemberDeleteArgsSchema: z.ZodType<Omit<Prisma.MemberDeleteArgs, "select" | "include">> = z.object({
  where: MemberWhereUniqueInputSchema,
}).strict() ;

export const MemberUpdateArgsSchema: z.ZodType<Omit<Prisma.MemberUpdateArgs, "select" | "include">> = z.object({
  data: z.union([ MemberUpdateInputSchema,MemberUncheckedUpdateInputSchema ]),
  where: MemberWhereUniqueInputSchema,
}).strict() ;

export const MemberUpdateManyArgsSchema: z.ZodType<Prisma.MemberUpdateManyArgs> = z.object({
  data: z.union([ MemberUpdateManyMutationInputSchema,MemberUncheckedUpdateManyInputSchema ]),
  where: MemberWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export const MemberUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.MemberUpdateManyAndReturnArgs> = z.object({
  data: z.union([ MemberUpdateManyMutationInputSchema,MemberUncheckedUpdateManyInputSchema ]),
  where: MemberWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export const MemberDeleteManyArgsSchema: z.ZodType<Prisma.MemberDeleteManyArgs> = z.object({
  where: MemberWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export const InvitationCreateArgsSchema: z.ZodType<Omit<Prisma.InvitationCreateArgs, "select" | "include">> = z.object({
  data: z.union([ InvitationCreateInputSchema,InvitationUncheckedCreateInputSchema ]),
}).strict() ;

export const InvitationUpsertArgsSchema: z.ZodType<Omit<Prisma.InvitationUpsertArgs, "select" | "include">> = z.object({
  where: InvitationWhereUniqueInputSchema,
  create: z.union([ InvitationCreateInputSchema,InvitationUncheckedCreateInputSchema ]),
  update: z.union([ InvitationUpdateInputSchema,InvitationUncheckedUpdateInputSchema ]),
}).strict() ;

export const InvitationCreateManyArgsSchema: z.ZodType<Prisma.InvitationCreateManyArgs> = z.object({
  data: z.union([ InvitationCreateManyInputSchema,InvitationCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const InvitationCreateManyAndReturnArgsSchema: z.ZodType<Prisma.InvitationCreateManyAndReturnArgs> = z.object({
  data: z.union([ InvitationCreateManyInputSchema,InvitationCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const InvitationDeleteArgsSchema: z.ZodType<Omit<Prisma.InvitationDeleteArgs, "select" | "include">> = z.object({
  where: InvitationWhereUniqueInputSchema,
}).strict() ;

export const InvitationUpdateArgsSchema: z.ZodType<Omit<Prisma.InvitationUpdateArgs, "select" | "include">> = z.object({
  data: z.union([ InvitationUpdateInputSchema,InvitationUncheckedUpdateInputSchema ]),
  where: InvitationWhereUniqueInputSchema,
}).strict() ;

export const InvitationUpdateManyArgsSchema: z.ZodType<Prisma.InvitationUpdateManyArgs> = z.object({
  data: z.union([ InvitationUpdateManyMutationInputSchema,InvitationUncheckedUpdateManyInputSchema ]),
  where: InvitationWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export const InvitationUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.InvitationUpdateManyAndReturnArgs> = z.object({
  data: z.union([ InvitationUpdateManyMutationInputSchema,InvitationUncheckedUpdateManyInputSchema ]),
  where: InvitationWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export const InvitationDeleteManyArgsSchema: z.ZodType<Prisma.InvitationDeleteManyArgs> = z.object({
  where: InvitationWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export const PurchaseCreateArgsSchema: z.ZodType<Omit<Prisma.PurchaseCreateArgs, "select" | "include">> = z.object({
  data: z.union([ PurchaseCreateInputSchema,PurchaseUncheckedCreateInputSchema ]),
}).strict() ;

export const PurchaseUpsertArgsSchema: z.ZodType<Omit<Prisma.PurchaseUpsertArgs, "select" | "include">> = z.object({
  where: PurchaseWhereUniqueInputSchema,
  create: z.union([ PurchaseCreateInputSchema,PurchaseUncheckedCreateInputSchema ]),
  update: z.union([ PurchaseUpdateInputSchema,PurchaseUncheckedUpdateInputSchema ]),
}).strict() ;

export const PurchaseCreateManyArgsSchema: z.ZodType<Prisma.PurchaseCreateManyArgs> = z.object({
  data: z.union([ PurchaseCreateManyInputSchema,PurchaseCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const PurchaseCreateManyAndReturnArgsSchema: z.ZodType<Prisma.PurchaseCreateManyAndReturnArgs> = z.object({
  data: z.union([ PurchaseCreateManyInputSchema,PurchaseCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const PurchaseDeleteArgsSchema: z.ZodType<Omit<Prisma.PurchaseDeleteArgs, "select" | "include">> = z.object({
  where: PurchaseWhereUniqueInputSchema,
}).strict() ;

export const PurchaseUpdateArgsSchema: z.ZodType<Omit<Prisma.PurchaseUpdateArgs, "select" | "include">> = z.object({
  data: z.union([ PurchaseUpdateInputSchema,PurchaseUncheckedUpdateInputSchema ]),
  where: PurchaseWhereUniqueInputSchema,
}).strict() ;

export const PurchaseUpdateManyArgsSchema: z.ZodType<Prisma.PurchaseUpdateManyArgs> = z.object({
  data: z.union([ PurchaseUpdateManyMutationInputSchema,PurchaseUncheckedUpdateManyInputSchema ]),
  where: PurchaseWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export const PurchaseUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.PurchaseUpdateManyAndReturnArgs> = z.object({
  data: z.union([ PurchaseUpdateManyMutationInputSchema,PurchaseUncheckedUpdateManyInputSchema ]),
  where: PurchaseWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export const PurchaseDeleteManyArgsSchema: z.ZodType<Prisma.PurchaseDeleteManyArgs> = z.object({
  where: PurchaseWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export const AiChatCreateArgsSchema: z.ZodType<Omit<Prisma.AiChatCreateArgs, "select" | "include">> = z.object({
  data: z.union([ AiChatCreateInputSchema,AiChatUncheckedCreateInputSchema ]),
}).strict() ;

export const AiChatUpsertArgsSchema: z.ZodType<Omit<Prisma.AiChatUpsertArgs, "select" | "include">> = z.object({
  where: AiChatWhereUniqueInputSchema,
  create: z.union([ AiChatCreateInputSchema,AiChatUncheckedCreateInputSchema ]),
  update: z.union([ AiChatUpdateInputSchema,AiChatUncheckedUpdateInputSchema ]),
}).strict() ;

export const AiChatCreateManyArgsSchema: z.ZodType<Prisma.AiChatCreateManyArgs> = z.object({
  data: z.union([ AiChatCreateManyInputSchema,AiChatCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const AiChatCreateManyAndReturnArgsSchema: z.ZodType<Prisma.AiChatCreateManyAndReturnArgs> = z.object({
  data: z.union([ AiChatCreateManyInputSchema,AiChatCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const AiChatDeleteArgsSchema: z.ZodType<Omit<Prisma.AiChatDeleteArgs, "select" | "include">> = z.object({
  where: AiChatWhereUniqueInputSchema,
}).strict() ;

export const AiChatUpdateArgsSchema: z.ZodType<Omit<Prisma.AiChatUpdateArgs, "select" | "include">> = z.object({
  data: z.union([ AiChatUpdateInputSchema,AiChatUncheckedUpdateInputSchema ]),
  where: AiChatWhereUniqueInputSchema,
}).strict() ;

export const AiChatUpdateManyArgsSchema: z.ZodType<Prisma.AiChatUpdateManyArgs> = z.object({
  data: z.union([ AiChatUpdateManyMutationInputSchema,AiChatUncheckedUpdateManyInputSchema ]),
  where: AiChatWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export const AiChatUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.AiChatUpdateManyAndReturnArgs> = z.object({
  data: z.union([ AiChatUpdateManyMutationInputSchema,AiChatUncheckedUpdateManyInputSchema ]),
  where: AiChatWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export const AiChatDeleteManyArgsSchema: z.ZodType<Prisma.AiChatDeleteManyArgs> = z.object({
  where: AiChatWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export const BlogPostCreateArgsSchema: z.ZodType<Omit<Prisma.BlogPostCreateArgs, "select" | "include">> = z.object({
  data: z.union([ BlogPostCreateInputSchema,BlogPostUncheckedCreateInputSchema ]),
}).strict() ;

export const BlogPostUpsertArgsSchema: z.ZodType<Omit<Prisma.BlogPostUpsertArgs, "select" | "include">> = z.object({
  where: BlogPostWhereUniqueInputSchema,
  create: z.union([ BlogPostCreateInputSchema,BlogPostUncheckedCreateInputSchema ]),
  update: z.union([ BlogPostUpdateInputSchema,BlogPostUncheckedUpdateInputSchema ]),
}).strict() ;

export const BlogPostCreateManyArgsSchema: z.ZodType<Prisma.BlogPostCreateManyArgs> = z.object({
  data: z.union([ BlogPostCreateManyInputSchema,BlogPostCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const BlogPostCreateManyAndReturnArgsSchema: z.ZodType<Prisma.BlogPostCreateManyAndReturnArgs> = z.object({
  data: z.union([ BlogPostCreateManyInputSchema,BlogPostCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const BlogPostDeleteArgsSchema: z.ZodType<Omit<Prisma.BlogPostDeleteArgs, "select" | "include">> = z.object({
  where: BlogPostWhereUniqueInputSchema,
}).strict() ;

export const BlogPostUpdateArgsSchema: z.ZodType<Omit<Prisma.BlogPostUpdateArgs, "select" | "include">> = z.object({
  data: z.union([ BlogPostUpdateInputSchema,BlogPostUncheckedUpdateInputSchema ]),
  where: BlogPostWhereUniqueInputSchema,
}).strict() ;

export const BlogPostUpdateManyArgsSchema: z.ZodType<Prisma.BlogPostUpdateManyArgs> = z.object({
  data: z.union([ BlogPostUpdateManyMutationInputSchema,BlogPostUncheckedUpdateManyInputSchema ]),
  where: BlogPostWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export const BlogPostUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.BlogPostUpdateManyAndReturnArgs> = z.object({
  data: z.union([ BlogPostUpdateManyMutationInputSchema,BlogPostUncheckedUpdateManyInputSchema ]),
  where: BlogPostWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export const BlogPostDeleteManyArgsSchema: z.ZodType<Prisma.BlogPostDeleteManyArgs> = z.object({
  where: BlogPostWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export const SubscriptionPlanCreateArgsSchema: z.ZodType<Omit<Prisma.SubscriptionPlanCreateArgs, "select" | "include">> = z.object({
  data: z.union([ SubscriptionPlanCreateInputSchema,SubscriptionPlanUncheckedCreateInputSchema ]),
}).strict() ;

export const SubscriptionPlanUpsertArgsSchema: z.ZodType<Omit<Prisma.SubscriptionPlanUpsertArgs, "select" | "include">> = z.object({
  where: SubscriptionPlanWhereUniqueInputSchema,
  create: z.union([ SubscriptionPlanCreateInputSchema,SubscriptionPlanUncheckedCreateInputSchema ]),
  update: z.union([ SubscriptionPlanUpdateInputSchema,SubscriptionPlanUncheckedUpdateInputSchema ]),
}).strict() ;

export const SubscriptionPlanCreateManyArgsSchema: z.ZodType<Prisma.SubscriptionPlanCreateManyArgs> = z.object({
  data: z.union([ SubscriptionPlanCreateManyInputSchema,SubscriptionPlanCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const SubscriptionPlanCreateManyAndReturnArgsSchema: z.ZodType<Prisma.SubscriptionPlanCreateManyAndReturnArgs> = z.object({
  data: z.union([ SubscriptionPlanCreateManyInputSchema,SubscriptionPlanCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const SubscriptionPlanDeleteArgsSchema: z.ZodType<Omit<Prisma.SubscriptionPlanDeleteArgs, "select" | "include">> = z.object({
  where: SubscriptionPlanWhereUniqueInputSchema,
}).strict() ;

export const SubscriptionPlanUpdateArgsSchema: z.ZodType<Omit<Prisma.SubscriptionPlanUpdateArgs, "select" | "include">> = z.object({
  data: z.union([ SubscriptionPlanUpdateInputSchema,SubscriptionPlanUncheckedUpdateInputSchema ]),
  where: SubscriptionPlanWhereUniqueInputSchema,
}).strict() ;

export const SubscriptionPlanUpdateManyArgsSchema: z.ZodType<Prisma.SubscriptionPlanUpdateManyArgs> = z.object({
  data: z.union([ SubscriptionPlanUpdateManyMutationInputSchema,SubscriptionPlanUncheckedUpdateManyInputSchema ]),
  where: SubscriptionPlanWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export const SubscriptionPlanUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.SubscriptionPlanUpdateManyAndReturnArgs> = z.object({
  data: z.union([ SubscriptionPlanUpdateManyMutationInputSchema,SubscriptionPlanUncheckedUpdateManyInputSchema ]),
  where: SubscriptionPlanWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export const SubscriptionPlanDeleteManyArgsSchema: z.ZodType<Prisma.SubscriptionPlanDeleteManyArgs> = z.object({
  where: SubscriptionPlanWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export const UserSubscriptionCreateArgsSchema: z.ZodType<Omit<Prisma.UserSubscriptionCreateArgs, "select" | "include">> = z.object({
  data: z.union([ UserSubscriptionCreateInputSchema,UserSubscriptionUncheckedCreateInputSchema ]),
}).strict() ;

export const UserSubscriptionUpsertArgsSchema: z.ZodType<Omit<Prisma.UserSubscriptionUpsertArgs, "select" | "include">> = z.object({
  where: UserSubscriptionWhereUniqueInputSchema,
  create: z.union([ UserSubscriptionCreateInputSchema,UserSubscriptionUncheckedCreateInputSchema ]),
  update: z.union([ UserSubscriptionUpdateInputSchema,UserSubscriptionUncheckedUpdateInputSchema ]),
}).strict() ;

export const UserSubscriptionCreateManyArgsSchema: z.ZodType<Prisma.UserSubscriptionCreateManyArgs> = z.object({
  data: z.union([ UserSubscriptionCreateManyInputSchema,UserSubscriptionCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const UserSubscriptionCreateManyAndReturnArgsSchema: z.ZodType<Prisma.UserSubscriptionCreateManyAndReturnArgs> = z.object({
  data: z.union([ UserSubscriptionCreateManyInputSchema,UserSubscriptionCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const UserSubscriptionDeleteArgsSchema: z.ZodType<Omit<Prisma.UserSubscriptionDeleteArgs, "select" | "include">> = z.object({
  where: UserSubscriptionWhereUniqueInputSchema,
}).strict() ;

export const UserSubscriptionUpdateArgsSchema: z.ZodType<Omit<Prisma.UserSubscriptionUpdateArgs, "select" | "include">> = z.object({
  data: z.union([ UserSubscriptionUpdateInputSchema,UserSubscriptionUncheckedUpdateInputSchema ]),
  where: UserSubscriptionWhereUniqueInputSchema,
}).strict() ;

export const UserSubscriptionUpdateManyArgsSchema: z.ZodType<Prisma.UserSubscriptionUpdateManyArgs> = z.object({
  data: z.union([ UserSubscriptionUpdateManyMutationInputSchema,UserSubscriptionUncheckedUpdateManyInputSchema ]),
  where: UserSubscriptionWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export const UserSubscriptionUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.UserSubscriptionUpdateManyAndReturnArgs> = z.object({
  data: z.union([ UserSubscriptionUpdateManyMutationInputSchema,UserSubscriptionUncheckedUpdateManyInputSchema ]),
  where: UserSubscriptionWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export const UserSubscriptionDeleteManyArgsSchema: z.ZodType<Prisma.UserSubscriptionDeleteManyArgs> = z.object({
  where: UserSubscriptionWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export const BlogCategoryCreateArgsSchema: z.ZodType<Omit<Prisma.BlogCategoryCreateArgs, "select" | "include">> = z.object({
  data: z.union([ BlogCategoryCreateInputSchema,BlogCategoryUncheckedCreateInputSchema ]),
}).strict() ;

export const BlogCategoryUpsertArgsSchema: z.ZodType<Omit<Prisma.BlogCategoryUpsertArgs, "select" | "include">> = z.object({
  where: BlogCategoryWhereUniqueInputSchema,
  create: z.union([ BlogCategoryCreateInputSchema,BlogCategoryUncheckedCreateInputSchema ]),
  update: z.union([ BlogCategoryUpdateInputSchema,BlogCategoryUncheckedUpdateInputSchema ]),
}).strict() ;

export const BlogCategoryCreateManyArgsSchema: z.ZodType<Prisma.BlogCategoryCreateManyArgs> = z.object({
  data: z.union([ BlogCategoryCreateManyInputSchema,BlogCategoryCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const BlogCategoryCreateManyAndReturnArgsSchema: z.ZodType<Prisma.BlogCategoryCreateManyAndReturnArgs> = z.object({
  data: z.union([ BlogCategoryCreateManyInputSchema,BlogCategoryCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const BlogCategoryDeleteArgsSchema: z.ZodType<Omit<Prisma.BlogCategoryDeleteArgs, "select" | "include">> = z.object({
  where: BlogCategoryWhereUniqueInputSchema,
}).strict() ;

export const BlogCategoryUpdateArgsSchema: z.ZodType<Omit<Prisma.BlogCategoryUpdateArgs, "select" | "include">> = z.object({
  data: z.union([ BlogCategoryUpdateInputSchema,BlogCategoryUncheckedUpdateInputSchema ]),
  where: BlogCategoryWhereUniqueInputSchema,
}).strict() ;

export const BlogCategoryUpdateManyArgsSchema: z.ZodType<Prisma.BlogCategoryUpdateManyArgs> = z.object({
  data: z.union([ BlogCategoryUpdateManyMutationInputSchema,BlogCategoryUncheckedUpdateManyInputSchema ]),
  where: BlogCategoryWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export const BlogCategoryUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.BlogCategoryUpdateManyAndReturnArgs> = z.object({
  data: z.union([ BlogCategoryUpdateManyMutationInputSchema,BlogCategoryUncheckedUpdateManyInputSchema ]),
  where: BlogCategoryWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export const BlogCategoryDeleteManyArgsSchema: z.ZodType<Prisma.BlogCategoryDeleteManyArgs> = z.object({
  where: BlogCategoryWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;