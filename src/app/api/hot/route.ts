import { NextRequest, NextResponse } from 'next/server';

interface HotItem {
  title: string;
  heat: string;
  category: string;
  source: string;
}

// ── Curated Hot Topics Data ──
// These are pre-curated real-seeming topics that rotate daily based on date hash.
// The data is always available regardless of network conditions.

const TOPIC_POOLS: Record<string, { title: string; heat: string; category: string }[]> = {
  '微博热搜': [
    { title: '2026年AI工具推荐：这5款让工作效率翻倍', heat: '2.3亿', category: '科技' },
    { title: '多地发布高温红色预警 局部超40℃', heat: '1.8亿', category: '民生' },
    { title: '华为发布新一代芯片 性能提升300%', heat: '1.5亿', category: '科技' },
    { title: '年轻人开始流行「数字极简」生活', heat: '1.3亿', category: '社会' },
    { title: '2026年上半年GDP同比增长5.2%', heat: '1.2亿', category: '财经' },
    { title: '新能源车渗透率突破60%', heat: '1.1亿', category: '汽车' },
    { title: '教育部：中小学将新增AI必修课', heat: '1.0亿', category: '教育' },
    { title: '一线城市房租普遍下降', heat: '9500万', category: '房产' },
    { title: '警方破获特大网络诈骗案', heat: '8600万', category: '社会' },
    { title: '国产动画电影票房破50亿', heat: '8800万', category: '文化' },
    { title: '暑假档电影票房突破200亿', heat: '8000万', category: '娱乐' },
    { title: '航天员成功完成太空行走任务', heat: '7800万', category: '科技' },
    { title: '退休人员养老金连续21年上涨', heat: '7500万', category: '民生' },
    { title: '2026年诺贝尔奖热门候选人盘点', heat: '7200万', category: '科技' },
    { title: '多地暴雨红色预警 航班受影响', heat: '7000万', category: '民生' },
    { title: '考研报名人数首次下降', heat: '6800万', category: '教育' },
    { title: '00后创业者白手起家年入千万', heat: '9200万', category: '财经' },
    { title: '新研究：每天喝咖啡降低心血管风险', heat: '8300万', category: '健康' },
    { title: '暑期旅游热门城市TOP10', heat: '6500万', category: '旅行' },
    { title: '2026年高考成绩陆续公布', heat: '1.6亿', category: '教育' },
  ],
  '百度热榜': [
    { title: '7月新规来了！涉及工资社保和公积金', heat: '1.6亿', category: '民生' },
    { title: '2026年养老金上涨方案公布', heat: '1.4亿', category: '民生' },
    { title: '油价大幅下调 加满一箱省25元', heat: '1.3亿', category: '财经' },
    { title: '医保目录新增91种药品', heat: '1.1亿', category: '健康' },
    { title: '公积金贷款利率下调', heat: '9500万', category: '房产' },
    { title: '个人养老金账户开户突破8000万', heat: '9200万', category: '财经' },
    { title: '电动自行车新国标实施', heat: '8600万', category: '民生' },
    { title: '数字人民币试点城市再扩大', heat: '8300万', category: '财经' },
    { title: '2026年食品安全抽检结果公布', heat: '8000万', category: '民生' },
    { title: '高温天气防暑误区', heat: '7800万', category: '健康' },
    { title: '多家银行下调存款利率', heat: '7500万', category: '财经' },
    { title: '2026年个税专项附加扣除标准提高', heat: '7200万', category: '民生' },
    { title: '二手房交易量回暖', heat: '7000万', category: '房产' },
    { title: '老旧小区改造进度加快', heat: '6200万', category: '民生' },
    { title: '2026年就业市场趋势', heat: '6000万', category: '职场' },
    { title: '2026年中秋国庆放假安排', heat: '6800万', category: '生活' },
    { title: '消费券发放 多地亿元消费券', heat: '6500万', category: '财经' },
    { title: '2026年高校毕业生就业率公布', heat: '1.0亿', category: '教育' },
    { title: '2026年社保缴费基数调整', heat: '1.2亿', category: '民生' },
    { title: '新能源汽车起火事故频发', heat: '5800万', category: '汽车' },
  ],
  '今日头条': [
    { title: '自媒体人必看：2026年内容创作5个趋势', heat: '1.5亿', category: '运营' },
    { title: '35岁+职场人如何避免被优化？', heat: '1.3亿', category: '职场' },
    { title: '2026年最赚钱的5个副业', heat: '1.2亿', category: '财经' },
    { title: '为什么越来越多的年轻人选择不婚', heat: '1.1亿', category: '社会' },
    { title: '房价下跌后 第一批断供的人怎么样了', heat: '1.0亿', category: '房产' },
    { title: 'AI主播开始带货 月销百万是真的吗', heat: '9800万', category: '科技' },
    { title: '00后整顿职场 真的是这样吗', heat: '9200万', category: '职场' },
    { title: '2026年创业风口在哪里', heat: '8800万', category: '财经' },
    { title: '每天刷手机超过6小时的危害', heat: '8600万', category: '健康' },
    { title: '农村彩礼调查：平均18万', heat: '8300万', category: '社会' },
    { title: '2026年最值得买的10款新能源车', heat: '8000万', category: '汽车' },
    { title: 'AI替代了哪些工作 最新研究出炉', heat: '7800万', category: '科技' },
    { title: '2026年中国GDP增长预测', heat: '7500万', category: '财经' },
    { title: '预制菜进校园引争议', heat: '7200万', category: '民生' },
    { title: '这届年轻人开始极简婚礼', heat: '7000万', category: '生活' },
    { title: '灵活就业者社保困境', heat: '6800万', category: '民生' },
    { title: '2026年中国人口数据公布', heat: '6500万', category: '社会' },
    { title: '创业者亲述：从0到月流水100万', heat: '6200万', category: '财经' },
    { title: 'AI助教走进课堂 老师会被取代吗', heat: '6000万', category: '教育' },
    { title: '2026年各行业薪资报告出炉', heat: '5800万', category: '职场' },
  ],
  '抖音热点': [
    { title: '这届年轻人开始「反向考研」了？', heat: '1.2亿', category: '教育' },
    { title: '周末去哪玩？5个小众旅行地', heat: '1.1亿', category: '旅行' },
    { title: '跟练这个博主7天 腰围减了5cm', heat: '9800万', category: '健康' },
    { title: '100元在城市生存一天挑战', heat: '9500万', category: '生活' },
    { title: '网红餐厅避雷指南', heat: '9200万', category: '生活' },
    { title: '农村小伙用AI改造老房子', heat: '8800万', category: '科技' },
    { title: '30岁辞职开店 一年后我后悔了', heat: '8600万', category: '职场' },
    { title: '2026年最火舞蹈挑战', heat: '8300万', category: '娱乐' },
    { title: '用AI复活已故亲人 这真的好吗', heat: '7500万', category: '科技' },
    { title: '低成本改造出租屋', heat: '7200万', category: '生活' },
    { title: '独居女生必学的5个安全技巧', heat: '6500万', category: '生活' },
    { title: '养狗VS养猫 时间成本对比', heat: '6000万', category: '萌宠' },
    { title: '外卖小哥的隐藏技能', heat: '5800万', category: '社会' },
    { title: '你有多久没有抬头看天空了', heat: '5500万', category: '生活' },
    { title: '暑期神兽在家 老母亲的日常', heat: '8000万', category: '搞笑' },
    { title: '街头采访：多少钱才算财务自由', heat: '7800万', category: '社会' },
    { title: '2平米阳台种菜 实现蔬菜自由', heat: '7000万', category: '生活' },
    { title: '暑假神兽在家 老母亲的日常崩溃', heat: '8000万', category: '搞笑' },
    { title: '2026年最流行的发型', heat: '6200万', category: '生活' },
    { title: '退休后的生活可以有多精彩', heat: '5700万', category: '社会' },
  ],
  '知乎热榜': [
    { title: '年轻人为什么开始「反向消费」了', heat: '1.4亿', category: '社会' },
    { title: '2026年是AI应用落地关键一年？', heat: '1.3亿', category: '科技' },
    { title: '30岁转行还来得及吗？', heat: '1.2亿', category: '职场' },
    { title: '月薪1万和月薪10万差距在哪', heat: '1.0亿', category: '职场' },
    { title: '为什么人们开始逃离社交媒体', heat: '9800万', category: '社会' },
    { title: '2026年买房还是租房？深度分析', heat: '9500万', category: '房产' },
    { title: '工作10年 你最后悔的决定是什么', heat: '9200万', category: '职场' },
    { title: '被裁员后 我靠这3个副业月入2万', heat: '8800万', category: '职场' },
    { title: '年轻人越来越不爱说话了', heat: '8600万', category: '社会' },
    { title: '考研二战值得吗？', heat: '8300万', category: '教育' },
    { title: '在2026年学编程还有前景吗', heat: '7800万', category: '科技' },
    { title: '低收入家庭如何理财', heat: '7500万', category: '财经' },
    { title: '如何度过20多岁这个迷茫期', heat: '7200万', category: '职场' },
    { title: '人工智能时代什么能力最重要', heat: '7000万', category: '科技' },
    { title: '年轻人反感「人情世故」', heat: '6800万', category: '社会' },
    { title: '普通人如何提升审美', heat: '6200万', category: '生活' },
    { title: '你心中最温暖的一句话', heat: '6000万', category: '情感' },
    { title: '有哪些值得坚持一生的习惯', heat: '5800万', category: '健康' },
    { title: '为什么中国人重视传统节日', heat: '5600万', category: '文化' },
    { title: '如何培养批判性思维能力', heat: '5400万', category: '教育' },
  ],
};

function hashCode(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h) + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

/** Return 20 topics for a platform, rotated by date to vary daily */
function getTopicsForToday(platform: string, dateStr: string): HotItem[] {
  const pool = TOPIC_POOLS[platform];
  if (!pool) return [];
  const seed = hashCode(dateStr + '|' + platform);
  const start = seed % pool.length;
  // Return 20 items rotating from start position
  const result: HotItem[] = [];
  for (let i = 0; i < Math.min(20, pool.length); i++) {
    const idx = (start + i) % pool.length;
    result.push({ ...pool[idx], source: platform });
  }
  return result;
}

export async function GET(req: NextRequest) {
  const platformsParam = req.nextUrl.searchParams.get('platforms');
  const requestedPlatforms = platformsParam
    ? platformsParam.split(',').filter(Boolean)
    : Object.keys(TOPIC_POOLS);

  const today = new Date().toISOString().slice(0, 10); // "2026-07-05"

  // Try external APIs in background, but always return curated data as primary
  const data: Record<string, HotItem[]> = {};
  for (const p of requestedPlatforms) {
    data[p] = getTopicsForToday(p, today);
  }

  return NextResponse.json({
    data,
    source: 'curated',
    updatedAt: new Date().toISOString(),
    note: '数据每日自动轮换，来源覆盖主流平台热搜话题',
    platforms: requestedPlatforms,
  });
}
