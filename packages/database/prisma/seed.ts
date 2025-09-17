import { PrismaClient } from "@prisma/client";
import { Decimal } from "decimal.js";
import { config } from "@repo/config";

const prisma = new PrismaClient();

async function main() {
  console.log("开始创建种子数据...");

  // 创建订阅计划
  const plans = [];
  
  // 创建月度会员计划 (from pro prices[0])
  if (config.payments.plans.pro?.prices?.[0]) {
    const monthlyPrice = config.payments.plans.pro.prices[0];
    plans.push(
      await prisma.subscriptionPlan.upsert({
        where: { slug: "monthly" },
        update: {},
        create: {
          name: "月度会员",
          slug: "monthly",
          description: "按月订阅，随时取消",
          price: new Decimal(monthlyPrice.amount),
          currency: monthlyPrice.currency,
          interval: "MONTH",
          intervalCount: 1,
          features: JSON.stringify([
            "访问所有付费文章",
            "专属会员标识",
            "优先技术支持",
            "每月更新的独家内容"
          ]),
          active: true,
        },
      })
    );
  }
  
  // 创建年度会员计划 (from pro prices[1])
  if (config.payments.plans.pro?.prices?.[1]) {
    const yearlyPrice = config.payments.plans.pro.prices[1];
    plans.push(
      await prisma.subscriptionPlan.upsert({
        where: { slug: "yearly" },
        update: {},
        create: {
          name: "年度会员",
          slug: "yearly",
          description: "按年订阅，享受优惠价格",
          price: new Decimal(yearlyPrice.amount),
          currency: yearlyPrice.currency,
          interval: "YEAR",
          intervalCount: 1,
          features: JSON.stringify([
            "访问所有付费文章",
            "专属会员标识",
            "优先技术支持",
            "每月更新的独家内容",
            "年度专属福利",
            "相比月度订阅节省17%"
          ]),
          active: true,
        },
      })
    );
  }
  
  // 创建终身会员计划 (from lifetime prices[0])
  if (config.payments.plans.lifetime?.prices?.[0]) {
    const lifetimePrice = config.payments.plans.lifetime.prices[0];
    plans.push(
      await prisma.subscriptionPlan.upsert({
        where: { slug: "lifetime" },
        update: {},
        create: {
          name: "终身会员",
          slug: "lifetime",
          description: "一次付费，永久有效",
          price: new Decimal(lifetimePrice.amount),
          currency: lifetimePrice.currency,
          interval: "LIFETIME",
          intervalCount: 1,
          features: JSON.stringify([
            "访问所有付费文章",
            "专属会员标识",
            "优先技术支持",
            "所有未来更新的内容",
            "终身VIP特权",
            "专属社区访问权限",
            "1对1技术咨询（每月1次）"
          ]),
          active: true,
        },
      })
    );
  }

  console.log(`创建了 ${plans.length} 个订阅计划`);

  // 创建博客分类
  const categories = await Promise.all([
    prisma.blogCategory.upsert({
      where: { slug: "frontend" },
      update: {},
      create: {
        name: "前端开发",
        slug: "frontend",
        description: "React, Vue, Angular等前端技术文章",
      },
    }),
    prisma.blogCategory.upsert({
      where: { slug: "backend" },
      update: {},
      create: {
        name: "后端开发",
        slug: "backend",
        description: "Node.js, Java, Python等后端技术文章",
      },
    }),
    prisma.blogCategory.upsert({
      where: { slug: "architecture" },
      update: {},
      create: {
        name: "架构设计",
        slug: "architecture",
        description: "系统架构、微服务、云原生等架构相关文章",
      },
    }),
    prisma.blogCategory.upsert({
      where: { slug: "devops" },
      update: {},
      create: {
        name: "DevOps",
        slug: "devops",
        description: "CI/CD、容器化、自动化运维等DevOps文章",
      },
    }),
  ]);

  console.log(`创建了 ${categories.length} 个博客分类`);

  console.log("种子数据创建完成！");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("创建种子数据时出错：", e);
    await prisma.$disconnect();
    process.exit(1);
  });
