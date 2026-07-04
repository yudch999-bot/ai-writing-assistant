'use client';

import { Flame, ExternalLink, Loader2, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';

const platforms = ['微博热搜', '百度热榜', '今日头条', '抖音热点', '知乎热榜', '微信热点'];
const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

// -----------------------------------------------
// 每天独立热点数据生成 (基于日期哈希，同一天始终相同)
// -----------------------------------------------
const allCategories = ['科技', '民生', '娱乐', '教育', '社会', '财经', '健康', '文化', '体育', '旅行', '职场', '运营', '汽车', '房产', '生活', '情感', '萌宠', '搞笑'];

// 各平台候选话题池（每天从中选 20 条，不同日期组合不同）
const topicPool: Record<string, { title: string; category: string }[]> = {
  '微博热搜': [
    { title: '2026年AI工具推荐：这5款让工作效率翻倍', category: '科技' },
    { title: '看完《长安三万里》续集，我理解了什么叫文化自信', category: '文化' },
    { title: '多地发布高温红色预警 局部超40℃', category: '民生' },
    { title: '某顶流明星被曝偷税漏税 金额惊人', category: '娱乐' },
    { title: '高考成绩陆续公布 志愿填报指南来了', category: '教育' },
    { title: '2026年最佳旅行目的地榜单出炉', category: '旅行' },
    { title: '华为发布新一代芯片 性能提升300%', category: '科技' },
    { title: '年轻人开始流行「数字极简」生活', category: '社会' },
    { title: '2026世界杯预选赛 中国队关键战告捷', category: '体育' },
    { title: '警方破获特大网络诈骗案 涉案金额超百亿', category: '社会' },
    { title: '某知名企业宣布全员涨薪20%', category: '财经' },
    { title: '新研究：每天喝咖啡可降低心血管疾病风险', category: '健康' },
    { title: '2026年上半年GDP同比增长5.2%', category: '财经' },
    { title: '一线城市房租普遍下降 原因找到了', category: '房产' },
    { title: '某综艺节目录制现场发生意外', category: '娱乐' },
    { title: '国产动画电影票房破50亿 创历史新高', category: '文化' },
    { title: '新能源车渗透率突破60% 燃油车何去何从', category: '汽车' },
    { title: '教育部：中小学将新增AI必修课', category: '教育' },
    { title: '2026年诺贝尔奖热门候选人盘点', category: '科技' },
    { title: '高温津贴发放标准调整 你收到了吗', category: '民生' },
    { title: '多地暴雨红色预警 航班高铁受影响', category: '民生' },
    { title: '故宫新展亮相 珍贵文物首次展出', category: '文化' },
    { title: '某科技公司发布全球首款AI手机', category: '科技' },
    { title: '2026年居民收入榜出炉 你的城市排第几', category: '财经' },
    { title: '短视频平台集体整治低俗内容', category: '社会' },
    { title: '00后创业者白手起家年入千万', category: '财经' },
    { title: '航天员成功完成太空行走任务', category: '科技' },
    { title: '2026年最火暑期档电影TOP10', category: '娱乐' },
    { title: '全国多地启动适龄女性HPV免费接种', category: '健康' },
    { title: '《黑神话：悟空2》正式官宣', category: '娱乐' },
    { title: '考研报名人数首次下降 原因何在', category: '教育' },
    { title: '最新研究：每天步行8000步降低早逝风险', category: '健康' },
    { title: '楼市新政落地 多地取消限购', category: '房产' },
    { title: '日本核污水排海最新检测数据公布', category: '社会' },
    { title: '国庆假期火车票开抢 热门线路秒空', category: '旅行' },
    { title: '这届年轻人迷上「寺庙游」 你怎么看', category: '生活' },
    { title: '2026年跨境电商进出口额增长35%', category: '财经' },
    { title: '高校开设AI伦理课程 引热议', category: '教育' },
    { title: '国产大飞机C919新增3条国际航线', category: '科技' },
    { title: '退休人员养老金连续21年上涨', category: '民生' },
  ],
  '百度热榜': [
    { title: '7月新规来了！涉及你的工资、社保和公积金', category: '民生' },
    { title: '2026年最新社保缴费基数调整，到手的钱有变化', category: '民生' },
    { title: '全国多地暴雨预警 出行需注意', category: '民生' },
    { title: '油价大幅下调 加满一箱省25元', category: '财经' },
    { title: '2026年养老金上涨方案公布', category: '民生' },
    { title: '医保目录新增91种药品 涵盖多个罕见病', category: '健康' },
    { title: '下半年考试日历发布 收藏备用', category: '教育' },
    { title: '个人养老金账户开户人数突破8000万', category: '财经' },
    { title: '公积金贷款利率下调 每月少还多少钱', category: '房产' },
    { title: '暑期档电影票房突破200亿 创历史新高', category: '娱乐' },
    { title: '2026年高校毕业生就业率数据公布', category: '教育' },
    { title: '多地调整落户政策 抢人大战升级', category: '社会' },
    { title: '数字人民币试点城市再扩大', category: '财经' },
    { title: '全国碳排放权交易市场运行一周年', category: '财经' },
    { title: '暑期旅游热门城市TOP10出炉', category: '旅行' },
    { title: '电动自行车新国标实施 你的车合规吗', category: '民生' },
    { title: '地铁安检新规 这些物品禁止携带', category: '民生' },
    { title: '2026年食品安全抽检结果公布', category: '民生' },
    { title: '快递新规：未获同意不得放快递柜', category: '民生' },
    { title: '高温天气下 这些防暑误区你中了几个', category: '健康' },
    { title: '多家银行下调存款利率 储户如何应对', category: '财经' },
    { title: '2026年个税专项附加扣除标准提高', category: '民生' },
    { title: '全国多地查处违规校外培训机构', category: '教育' },
    { title: '医保支付改革 看病会更便宜吗', category: '健康' },
    { title: '二手房交易量回暖 一线城市领涨', category: '房产' },
    { title: '2026年国家公务员考试公告发布', category: '教育' },
    { title: '新能源汽车起火事故频发 官方回应', category: '汽车' },
    { title: '全国多地推行智慧停车 缓解停车难', category: '民生' },
    { title: '2026年中秋国庆放假安排公布', category: '生活' },
    { title: '消费券发放 多地发放亿元消费券', category: '财经' },
    { title: '共享单车价格疯涨 你还会骑吗', category: '生活' },
    { title: '直系亲属房产过户新政策 契税减免', category: '房产' },
    { title: '2026年就业市场趋势 这些行业最缺人', category: '职场' },
    { title: '未成年人网络保护新规正式实施', category: '社会' },
    { title: '多地发布人才引进新政策 最高百万补贴', category: '社会' },
    { title: '成品油价格调整窗口开启 或迎年内最大跌幅', category: '财经' },
    { title: '2026年社保缴费基数上下限调整', category: '民生' },
    { title: '流感疫苗开打 这些人群建议优先接种', category: '健康' },
    { title: '夜间经济蓬勃发展 多地打造夜经济示范区', category: '财经' },
    { title: '老旧小区改造进度加快 惠及千万居民', category: '民生' },
  ],
  '今日头条': [
    { title: '自媒体人必看：2026年内容创作的5个趋势', category: '运营' },
    { title: '35岁+职场人如何避免被优化？这3条建议很实用', category: '职场' },
    { title: '县城体制内现状：降薪20%后没人辞职', category: '社会' },
    { title: '某大厂员工猝死引发加班文化反思', category: '职场' },
    { title: '2026年最赚钱的5个副业推荐', category: '财经' },
    { title: '为什么越来越多的年轻人选择不婚', category: '社会' },
    { title: '房价下跌后 第一批断供的人怎么样了', category: '房产' },
    { title: 'ChatGPT发布新版本 能力再升级', category: '科技' },
    { title: '2026年高考最难省份排名出炉', category: '教育' },
    { title: 'AI主播开始带货 月销百万是真的吗', category: '科技' },
    { title: '00后整顿职场 真的是这样吗', category: '职场' },
    { title: '2026年创业风口在哪里 这3个方向值得关注', category: '财经' },
    { title: '中医养生年轻化 这届年轻人开始保温杯泡枸杞', category: '健康' },
    { title: '三胎政策效果如何 最新数据来了', category: '民生' },
    { title: '2026年最值得买的10款新能源车', category: '汽车' },
    { title: '农村彩礼调查：平均18万 你怎么看', category: '社会' },
    { title: '小学教师反映工作负担过重 引热议', category: '教育' },
    { title: '2026年最火副业：AI训练师月入3万', category: '职场' },
    { title: '预制菜进校园引争议 家长怎么看', category: '民生' },
    { title: '越来越贵的奶茶 你还在喝吗', category: '生活' },
    { title: 'ChatGPT替代了哪些工作 最新研究出炉', category: '科技' },
    { title: '2026年房价走势预测 专家这样看', category: '房产' },
    { title: '上班族必备的5个AI工具', category: '科技' },
    { title: '城市流浪猫治理难题 何解', category: '社会' },
    { title: '2026年中国GDP增长预测 各机构怎么看', category: '财经' },
    { title: '这届年轻人开始极简婚礼 省下20万', category: '生活' },
    { title: 'AI绘画引发版权争议 你怎么看', category: '科技' },
    { title: '互联网大厂裁员潮持续 2026年就业形势', category: '职场' },
    { title: '80后父母的育儿观念 和上一代有何不同', category: '教育' },
    { title: '2026年最新健康生活方式TOP10', category: '健康' },
    { title: '元宇宙退烧 AR眼镜却火了', category: '科技' },
    { title: '2026年各行业薪资报告出炉', category: '职场' },
    { title: '年轻人为什么开始「反向买房」', category: '房产' },
    { title: '新能源汽车保费上涨 车主直呼买得起养不起', category: '汽车' },
    { title: '2026年最火旅行方式：城市漫步', category: '旅行' },
    { title: '灵活就业者社保困境 如何破局', category: '民生' },
    { title: '每天刷手机超过6小时 这些危害你知道吗', category: '健康' },
    { title: '2026年中国人口数据公布 出生率回升', category: '社会' },
    { title: '创业者亲述：从0到月流水100万的真实经历', category: '财经' },
    { title: 'AI助教走进课堂 老师会被取代吗', category: '教育' },
  ],
  '抖音热点': [
    { title: '这届年轻人开始「反向考研」了？', category: '教育' },
    { title: '周末去哪玩？这5个小众旅行地人少景美', category: '旅行' },
    { title: '挑战连续30天早起 第7天就崩了', category: '生活' },
    { title: '跟练这个博主7天 腰围减了5cm', category: '健康' },
    { title: '100元在城市生存一天挑战', category: '生活' },
    { title: '我妈第一次用AI的表情 笑翻了', category: '搞笑' },
    { title: '探店博主集体翻车 同一家店评价两极', category: '生活' },
    { title: '大学生毕业典礼上的神发言', category: '教育' },
    { title: '2026年最火的旅行打卡地合集', category: '旅行' },
    { title: '宠物也会emo？猫咪抑郁的5个信号', category: '萌宠' },
    { title: '网红餐厅避雷指南 这5家别去了', category: '生活' },
    { title: '农村小伙用AI改造老房子 效果惊艳', category: '科技' },
    { title: '30岁辞职开店 一年后我后悔了', category: '职场' },
    { title: '这些童年零食你还记得吗 看到第3个哭了', category: '生活' },
    { title: '情侣吵架和解的10种方式 最后一种绝了', category: '情感' },
    { title: '2026年最火舞蹈挑战 你也来试试', category: '娱乐' },
    { title: '妈妈做的饭VS外卖 差距有多大', category: '生活' },
    { title: '暑假神兽在家 老母亲的日常崩溃', category: '搞笑' },
    { title: '街头采访：你觉得多少钱才算财务自由', category: '社会' },
    { title: '资深驴友推荐的5条绝美徒步路线', category: '旅行' },
    { title: '用AI复活已故亲人 这真的好吗', category: '科技' },
    { title: '挑战100天不买东西 第30天我悟了', category: '生活' },
    { title: '你家宠物有什么怪癖', category: '萌宠' },
    { title: '第一次去男友家 带什么礼物合适', category: '情感' },
    { title: '2平米阳台种菜 实现蔬菜自由', category: '生活' },
    { title: '00后老师的课堂 和以前有什么不同', category: '教育' },
    { title: '独居女生必学的5个安全技巧', category: '生活' },
    { title: '100元吃一条街 哪座城市最值', category: '旅行' },
    { title: '爸爸带娃的一天 画风太真实了', category: '搞笑' },
    { title: '那些年我们追过的动画片', category: '娱乐' },
    { title: '工作群里的社死瞬间 你经历过吗', category: '职场' },
    { title: '低成本改造出租屋 房东看了都想涨租', category: '生活' },
    { title: '2026年最流行的发型 你敢尝试吗', category: '生活' },
    { title: '退休后的生活可以有多精彩', category: '社会' },
    { title: '养狗VS养猫 每天的时间成本对比', category: '萌宠' },
    { title: '高铁上遇到的奇葩事 在线征集', category: '旅行' },
    { title: '外卖小哥的隐藏技能 全能型选手', category: '社会' },
    { title: '你有多久没有抬头看天空了', category: '生活' },
    { title: '陌生人给过你的温暖瞬间', category: '情感' },
    { title: '2026年最火的健身挑战 你敢来吗', category: '健康' },
  ],
  '知乎热榜': [
    { title: '年轻人为什么开始「反向消费」了', category: '社会' },
    { title: '为什么说2026年是AI应用落地的关键一年？', category: '科技' },
    { title: '30岁转行还来得及吗？过来人的经验分享', category: '职场' },
    { title: '如何评价2026年的高考作文题？', category: '教育' },
    { title: '月薪1万和月薪10万的人差距到底在哪', category: '职场' },
    { title: '孩子沉迷短视频怎么办？心理学专家支招', category: '教育' },
    { title: '为什么越来越多的人开始逃离社交媒体', category: '社会' },
    { title: '哪些你以为很贵的东西其实很便宜？', category: '生活' },
    { title: '2026年买房还是租房？深度分析', category: '房产' },
    { title: '工作10年 你最后悔的决定是什么', category: '职场' },
    { title: '有哪些你以为是常识但很多人不知道的事', category: '生活' },
    { title: '被裁员后 我靠这3个副业月入2万', category: '职场' },
    { title: '中医 VS 西医 到底哪个更靠谱', category: '健康' },
    { title: '为什么现在的年轻人越来越不爱说话了', category: '社会' },
    { title: '有哪些让你「一见倾心」的诗句', category: '文化' },
    { title: '养猫和养狗的体验有什么不同？', category: '生活' },
    { title: '考研二战值得吗？过来人真实经历', category: '教育' },
    { title: '你经历过最社死的瞬间是什么', category: '生活' },
    { title: '有哪些你一直用但不知道原理的黑科技', category: '科技' },
    { title: '如何克服公共演讲的恐惧？实战经验分享', category: '职场' },
    { title: '能分享一下你的人生感悟吗', category: '生活' },
    { title: '为什么中国人越来越重视传统节日', category: '文化' },
    { title: '如何培养批判性思维能力', category: '教育' },
    { title: '旅行的意义是什么', category: '旅行' },
    { title: '为什么说情绪稳定是成年人最重要的能力', category: '职场' },
    { title: '你理想中的生活是什么样的', category: '生活' },
    { title: '在2026年学编程还有前景吗', category: '科技' },
    { title: '有哪些值得坚持一生的习惯', category: '健康' },
    { title: '我们这一代人最焦虑的是什么', category: '社会' },
    { title: '如何评价一本书的好坏', category: '文化' },
    { title: '为什么越来越多的人选择独居', category: '社会' },
    { title: '有哪些让你泪目的真实故事', category: '情感' },
    { title: '低收入家庭如何理财', category: '财经' },
    { title: '人工智能时代什么能力最重要', category: '科技' },
    { title: '如何度过20多岁这个迷茫期', category: '职场' },
    { title: '你什么时候觉得自己真的长大了', category: '生活' },
    { title: '为什么年轻人越来越反感「人情世故」', category: '社会' },
    { title: '有哪些实用的人际交往小技巧', category: '职场' },
    { title: '普通人如何提升审美', category: '生活' },
    { title: '你心中最温暖的一句话是什么', category: '情感' },
  ],
  '微信热点': [
    { title: '公众号流量主收益下降？这3个新打法值得尝试', category: '运营' },
    { title: '微信更新：这5个新功能你觉得实用吗', category: '科技' },
    { title: '视频号带货月入10万 普通人也能做吗', category: '运营' },
    { title: '朋友圈三天可见的人是什么心理', category: '社会' },
    { title: '2026年公众号爆文标题公式 建议收藏', category: '运营' },
    { title: '微信支付分升级 这些新权益你享受了吗', category: '科技' },
    { title: '公众号打开率持续走低 创作者该怎么办', category: '运营' },
    { title: '微信群聊新功能实测 太好用了', category: '科技' },
    { title: '2026年微信公众号运营趋势报告', category: '运营' },
    { title: '这届父母的朋友圈 太真实了', category: '生活' },
    { title: '微信读书2026上半年热门书单', category: '文化' },
    { title: '视频号直播带货新规解读', category: '运营' },
    { title: '公众号创作者如何拥抱AI工具', category: '运营' },
    { title: '你的微信通讯录里有多少「僵尸好友」', category: '生活' },
    { title: '微信键盘上线一周年 用户评价两极', category: '科技' },
    { title: '小程序电商新人如何从0到1', category: '运营' },
    { title: '看了100篇10w+后 我总结出这5个共性', category: '运营' },
    { title: '微信状态新表情上线 你最喜欢哪个', category: '科技' },
    { title: '公众号留言区精选技巧 互动率提升3倍', category: '运营' },
    { title: '微信小游戏月流水破千万 新的财富密码', category: '科技' },
    { title: '视频号如何快速涨粉 这5个方法亲测有效', category: '运营' },
    { title: '微信支付优化 这些变化影响日常使用', category: '科技' },
    { title: '公众号排版指南 提升阅读体验的10个技巧', category: '运营' },
    { title: '微信深色模式升级 更护眼了', category: '科技' },
    { title: '社群运营的7个核心方法论', category: '运营' },
    { title: '微信聊天记录备份新方法 再也不用担心丢失', category: '科技' },
    { title: '2026年私域流量运营趋势', category: '运营' },
    { title: '微信小商店升级 个人也能轻松开店', category: '科技' },
    { title: '公众号互推效果下降 还有哪些涨粉渠道', category: '运营' },
    { title: '微信红包封面又出新款 你抢到了吗', category: '生活' },
    { title: '视频号连麦功能上线 玩法更多样', category: '科技' },
    { title: '2026年公众号变现方式大盘点', category: '运营' },
    { title: '微信搜索优化技巧 提升文章曝光', category: '运营' },
    { title: '你被微信朋友圈广告精准推送了吗', category: '科技' },
    { title: '企业微信和个人微信的区别 你分得清吗', category: '科技' },
    { title: '公众号数据分析指南 读懂你的读者', category: '运营' },
    { title: '微信读书的隐藏功能 你都知道吗', category: '文化' },
    { title: '视频号直播如何提升转化 实操经验分享', category: '运营' },
    { title: '微信状态新玩法 可以和好友互动了', category: '科技' },
    { title: '公众号+视频号联动运营策略', category: '运营' },
  ],
};

/** 简单字符串哈希 (确定性) */
function hashCode(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h) + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

/** 为指定日期 + 平台生成 20 条热点 (同一天始终相同) */
function getTopicsForDate(dateStr: string, platform: string) {
  const pool = topicPool[platform];
  const count = 20;
  const seed = hashCode(dateStr + '|' + platform);
  // 从不同起始位置取连续的 20 条，确保同一天各平台都不同
  const start = seed % (pool.length - count + 1);
  const heats = ['2.3亿', '1.8亿', '1.6亿', '1.5亿', '1.4亿', '1.3亿', '1.2亿', '1.1亿', '1.0亿',
    '9500万', '9200万', '8800万', '8600万', '8300万', '8000万', '7800万', '7500万', '7200万', '7000万', '6800万'];

  return pool.slice(start, start + count).map((item, i) => ({
    title: item.title,
    heat: heats[i] || '6500万',
    category: item.category,
  }));
}

/** 生成某日所有平台的热点数据 */
function generateDayData(dateStr: string): Record<string, { title: string; heat: string; category: string }[]> {
  const data: Record<string, { title: string; heat: string; category: string }[]> = {};
  for (const p of platforms) {
    data[p] = getTopicsForDate(dateStr, p);
  }
  return data;
}

// -----------------------------------------------
// 日期工具
// -----------------------------------------------
/** 返回 "2026-07-04" 格式的日期字符串 */
function toDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function formatDateLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  const today = new Date();
  const todayStr = toDateStr(today);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = toDateStr(yesterday);

  if (dateStr === todayStr) return '今天';
  if (dateStr === yesterdayStr) return '昨天';
  return `${d.getMonth() + 1}月${d.getDate()}日`;
}

// -----------------------------------------------
// 组件
// -----------------------------------------------
export default function HotTopicsPage() {
  const router = useRouter();
  const [activeDate, setActiveDate] = useState(toDateStr(new Date()));
  const [activePlatform, setActivePlatform] = useState(platforms[0]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // 生成近 14 天的日期列表
  const dateList = useMemo(() => {
    const days: string[] = [];
    const today = new Date();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      days.push(toDateStr(d));
    }
    return days;
  }, []);

  // 当前选中日期的数据 (基于日期哈希，确定性)
  const topicData = useMemo(() => generateDayData(activeDate), [activeDate]);
  const topics = topicData[activePlatform] || [];
  const totalCount = Object.values(topicData).flat().length;

  const handlePrevDay = () => {
    const idx = dateList.indexOf(activeDate);
    if (idx > 0) setActiveDate(dateList[idx - 1]);
  };

  const handleNextDay = () => {
    const idx = dateList.indexOf(activeDate);
    if (idx < dateList.length - 1) setActiveDate(dateList[idx + 1]);
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Flame size={22} className="text-rose-400" />
          热点追踪
        </h1>
        <p className="text-[var(--color-text-secondary)] mt-1">
          按日期查看全网热点，每天数据独立，点击日历回看往日热点
        </p>
      </div>

      {/* 日历日期选择条 */}
      <div className="glass-card p-3">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
          <button
            onClick={handlePrevDay}
            disabled={dateList.indexOf(activeDate) <= 0}
            className="flex-shrink-0 p-1.5 rounded-lg hover:bg-[var(--color-surface-2)] disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={16} />
          </button>

          <div className="flex gap-1 flex-1 min-w-0 justify-center">
            {dateList.map((dateStr) => {
              const d = new Date(dateStr + 'T00:00:00');
              const isToday = dateStr === dateList[dateList.length - 1];
              const isActive = dateStr === activeDate;
              const wd = weekDays[d.getDay()];
              const dayNum = d.getDate();

              return (
                <button
                  key={dateStr}
                  onClick={() => setActiveDate(dateStr)}
                  className={`flex flex-col items-center gap-0.5 min-w-[44px] py-2 px-2 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-[var(--color-primary)]/15 text-[var(--color-primary-light)] ring-1 ring-[var(--color-primary)]/30 scale-105'
                      : 'hover:bg-[var(--color-surface-2)] text-[var(--color-text-secondary)]'
                  }`}
                >
                  <span className="text-[10px] font-medium">{isToday ? '今' : wd}</span>
                  <span className={`text-sm font-bold ${isActive ? 'text-[var(--color-primary-light)]' : ''}`}>
                    {dayNum}
                  </span>
                </button>
              );
            })}
          </div>

          <button
            onClick={handleNextDay}
            disabled={dateList.indexOf(activeDate) >= dateList.length - 1}
            className="flex-shrink-0 p-1.5 rounded-lg hover:bg-[var(--color-surface-2)] disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* 日期 + 统计标签 */}
      <div className="flex items-center justify-between">
        <div className="flex items-baseline gap-3">
          <span className="text-lg font-bold">{formatDateLabel(activeDate)}</span>
          <span className="text-xs text-[var(--color-text-secondary)]">{activeDate}</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-[var(--color-text-secondary)]">
          <span>{platforms.length} 个平台</span>
          <span className="w-1 h-1 rounded-full bg-[var(--color-text-secondary)]" />
          <span>{totalCount} 条热点</span>
        </div>
      </div>

      {/* 平台筛选 */}
      <div className="flex flex-wrap gap-2">
        {platforms.map(p => (
          <button
            key={p}
            onClick={() => setActivePlatform(p)}
            className={`tag ${activePlatform === p ? 'active' : ''}`}
          >
            {p}
          </button>
        ))}
      </div>

      {/* 热点列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {topics.map((topic, i) => (
          <div key={`${activeDate}-${activePlatform}-${i}`} className="glass-card p-4 glass-card-hover group">
            <div className="flex items-start gap-3">
              <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                i < 3 ? 'bg-rose-500/20 text-rose-400' : 'bg-[var(--color-surface-3)] text-[var(--color-text-secondary)]'
              }`}>
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium group-hover:text-[var(--color-primary-light)] transition-colors">
                  {topic.title}
                </h3>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary-light)]">
                    {activePlatform}
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400">
                    热度 {topic.heat}
                  </span>
                  <span className="text-[11px] text-[var(--color-text-secondary)]">{topic.category}</span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={() => router.push(`/article-generation?topic=${encodeURIComponent(topic.title)}`)}
                    className="text-xs text-[var(--color-primary-light)] hover:underline flex items-center gap-1"
                  >
                    <ExternalLink size={10} /> AI 改写
                  </button>
                  <button
                    onClick={() => {
                      setCopiedId(`${activeDate}-${activePlatform}-${i}`);
                      navigator.clipboard.writeText(topic.title);
                      setTimeout(() => setCopiedId(null), 2000);
                    }}
                    className="text-xs text-[var(--color-text-secondary)] hover:text-text transition-colors flex items-center gap-1"
                  >
                    {copiedId === `${activeDate}-${activePlatform}-${i}` ? <><Check size={10} className="text-emerald-400" /> 已复制</> : <>复制标题</>}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
