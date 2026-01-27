export default {
  schemaPath: './schema.prisma',
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
};
