'use client';

import { Flame, ExternalLink, Loader2, Check, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useSEO } from '../../lib/useSEO';

const platforms = ['微博热搜', '百度热榜', '今日头条', '抖音热点', '知乎热榜'];
const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

// -----------------------------------------------
// 备用数据（API 不可用时使用）
// -----------------------------------------------
const FALLBACK_TOPICS: Record<string, { title: string; heat: string; category: string }[]> = {
  '微博热搜': [
    { title: '2026年AI工具推荐：这5款让工作效率翻倍', heat: '2.3亿', category: '科技' },
    { title: '多地发布高温红色预警 局部超40℃', heat: '1.8亿', category: '民生' },
    { title: '高考成绩陆续公布 志愿填报指南来了', heat: '1.6亿', category: '教育' },
    { title: '华为发布新一代芯片 性能提升300%', heat: '1.5亿', category: '科技' },
    { title: '年轻人开始流行「数字极简」生活', heat: '1.3亿', category: '社会' },
    { title: '2026年上半年GDP同比增长5.2%', heat: '1.2亿', category: '财经' },
    { title: '新能源车渗透率突破60% 燃油车何去何从', heat: '1.1亿', category: '汽车' },
    { title: '教育部：中小学将新增AI必修课', heat: '1.0亿', category: '教育' },
    { title: '一线城市房租普遍下降 原因找到了', heat: '9500万', category: '房产' },
    { title: '00后创业者白手起家年入千万', heat: '9200万', category: '财经' },
    { title: '国产动画电影票房破50亿 创历史新高', heat: '8800万', category: '文化' },
    { title: '警方破获特大网络诈骗案 涉案金额超百亿', heat: '8600万', category: '社会' },
    { title: '新研究：每天喝咖啡可降低心血管疾病风险', heat: '8300万', category: '健康' },
    { title: '暑期档电影票房突破200亿 创历史新高', heat: '8000万', category: '娱乐' },
    { title: '航天员成功完成太空行走任务', heat: '7800万', category: '科技' },
    { title: '退休人员养老金连续21年上涨', heat: '7500万', category: '民生' },
    { title: '2026年诺贝尔奖热门候选人盘点', heat: '7200万', category: '科技' },
    { title: '多地暴雨红色预警 航班高铁受影响', heat: '7000万', category: '民生' },
    { title: '考研报名人数首次下降 原因何在', heat: '6800万', category: '教育' },
    { title: '2026年最火暑期档电影TOP10', heat: '6500万', category: '娱乐' },
  ],
  '百度热榜': [
    { title: '7月新规来了！涉及你的工资、社保和公积金', heat: '1.6亿', category: '民生' },
    { title: '2026年最新社保缴费基数调整', heat: '1.4亿', category: '民生' },
    { title: '油价大幅下调 加满一箱省25元', heat: '1.3亿', category: '财经' },
    { title: '2026年养老金上涨方案公布', heat: '1.2亿', category: '民生' },
    { title: '医保目录新增91种药品', heat: '1.1亿', category: '健康' },
    { title: '下半年考试日历发布 收藏备用', heat: '1.0亿', category: '教育' },
    { title: '公积金贷款利率下调 每月少还多少钱', heat: '9500万', category: '房产' },
    { title: '个人养老金账户开户人数突破8000万', heat: '9200万', category: '财经' },
    { title: '2026年高校毕业生就业率数据公布', heat: '8800万', category: '教育' },
    { title: '电动自行车新国标实施 你的车合规吗', heat: '8600万', category: '民生' },
    { title: '数字人民币试点城市再扩大', heat: '8300万', category: '财经' },
    { title: '2026年食品安全抽检结果公布', heat: '8000万', category: '民生' },
    { title: '高温天气下 这些防暑误区你中了几个', heat: '7800万', category: '健康' },
    { title: '多家银行下调存款利率 储户如何应对', heat: '7500万', category: '财经' },
    { title: '2026年个税专项附加扣除标准提高', heat: '7200万', category: '民生' },
    { title: '二手房交易量回暖 一线城市领涨', heat: '7000万', category: '房产' },
    { title: '2026年中秋国庆放假安排公布', heat: '6800万', category: '生活' },
    { title: '消费券发放 多地发放亿元消费券', heat: '6500万', category: '财经' },
    { title: '老旧小区改造进度加快 惠及千万居民', heat: '6200万', category: '民生' },
    { title: '2026年就业市场趋势 这些行业最缺人', heat: '6000万', category: '职场' },
  ],
  '今日头条': [
    { title: '自媒体人必看：2026年内容创作的5个趋势', heat: '1.5亿', category: '运营' },
    { title: '35岁+职场人如何避免被优化？这3条建议很实用', heat: '1.3亿', category: '职场' },
    { title: '2026年最赚钱的5个副业推荐', heat: '1.2亿', category: '财经' },
    { title: '为什么越来越多的年轻人选择不婚', heat: '1.1亿', category: '社会' },
    { title: '房价下跌后 第一批断供的人怎么样了', heat: '1.0亿', category: '房产' },
    { title: 'AI主播开始带货 月销百万是真的吗', heat: '9800万', category: '科技' },
    { title: '2026年高考最难省份排名出炉', heat: '9500万', category: '教育' },
    { title: '00后整顿职场 真的是这样吗', heat: '9200万', category: '职场' },
    { title: '2026年创业风口在哪里 这3个方向值得关注', heat: '8800万', category: '财经' },
    { title: '每天刷手机超过6小时 这些危害你知道吗', heat: '8600万', category: '健康' },
    { title: '农村彩礼调查：平均18万 你怎么看', heat: '8300万', category: '社会' },
    { title: '2026年最值得买的10款新能源车', heat: '8000万', category: '汽车' },
    { title: 'AI替代了哪些工作 最新研究出炉', heat: '7800万', category: '科技' },
    { title: '2026年中国GDP增长预测 各机构怎么看', heat: '7500万', category: '财经' },
    { title: '预制菜进校园引争议 家长怎么看', heat: '7200万', category: '民生' },
    { title: '这届年轻人开始极简婚礼 省下20万', heat: '7000万', category: '生活' },
    { title: '灵活就业者社保困境 如何破局', heat: '6800万', category: '民生' },
    { title: '2026年中国人口数据公布 出生率回升', heat: '6500万', category: '社会' },
    { title: '创业者亲述：从0到月流水100万的真实经历', heat: '6200万', category: '财经' },
    { title: 'AI助教走进课堂 老师会被取代吗', heat: '6000万', category: '教育' },
  ],
  '抖音热点': [
    { title: '这届年轻人开始「反向考研」了？', heat: '1.2亿', category: '教育' },
    { title: '周末去哪玩？这5个小众旅行地人少景美', heat: '1.1亿', category: '旅行' },
    { title: '挑战连续30天早起 第7天就崩了', heat: '1.0亿', category: '生活' },
    { title: '跟练这个博主7天 腰围减了5cm', heat: '9800万', category: '健康' },
    { title: '100元在城市生存一天挑战', heat: '9500万', category: '生活' },
    { title: '网红餐厅避雷指南 这5家别去了', heat: '9200万', category: '生活' },
    { title: '农村小伙用AI改造老房子 效果惊艳', heat: '8800万', category: '科技' },
    { title: '30岁辞职开店 一年后我后悔了', heat: '8600万', category: '职场' },
    { title: '2026年最火舞蹈挑战 你也来试试', heat: '8300万', category: '娱乐' },
    { title: '暑假神兽在家 老母亲的日常崩溃', heat: '8000万', category: '搞笑' },
    { title: '街头采访：你觉得多少钱才算财务自由', heat: '7800万', category: '社会' },
    { title: '用AI复活已故亲人 这真的好吗', heat: '7500万', category: '科技' },
    { title: '2平米阳台种菜 实现蔬菜自由', heat: '7200万', category: '生活' },
    { title: '100元吃一条街 哪座城市最值', heat: '7000万', category: '旅行' },
    { title: '低成本改造出租屋 房东看了都想涨租', heat: '6800万', category: '生活' },
    { title: '独居女生必学的5个安全技巧', heat: '6500万', category: '生活' },
    { title: '2026年最流行的发型 你敢尝试吗', heat: '6200万', category: '生活' },
    { title: '养狗VS养猫 每天的时间成本对比', heat: '6000万', category: '萌宠' },
    { title: '外卖小哥的隐藏技能 全能型选手', heat: '5800万', category: '社会' },
    { title: '你有多久没有抬头看天空了', heat: '5500万', category: '生活' },
  ],
  '知乎热榜': [
    { title: '年轻人为什么开始「反向消费」了', heat: '1.4亿', category: '社会' },
    { title: '为什么说2026年是AI应用落地的关键一年？', heat: '1.3亿', category: '科技' },
    { title: '30岁转行还来得及吗？过来人的经验分享', heat: '1.2亿', category: '职场' },
    { title: '如何评价2026年的高考作文题？', heat: '1.1亿', category: '教育' },
    { title: '月薪1万和月薪10万的人差距到底在哪', heat: '1.0亿', category: '职场' },
    { title: '为什么越来越多的人开始逃离社交媒体', heat: '9800万', category: '社会' },
    { title: '2026年买房还是租房？深度分析', heat: '9500万', category: '房产' },
    { title: '工作10年 你最后悔的决定是什么', heat: '9200万', category: '职场' },
    { title: '被裁员后 我靠这3个副业月入2万', heat: '8800万', category: '职场' },
    { title: '为什么现在的年轻人越来越不爱说话了', heat: '8600万', category: '社会' },
    { title: '考研二战值得吗？过来人真实经历', heat: '8300万', category: '教育' },
    { title: '如何克服公共演讲的恐惧？', heat: '8000万', category: '职场' },
    { title: '在2026年学编程还有前景吗', heat: '7800万', category: '科技' },
    { title: '低收入家庭如何理财', heat: '7500万', category: '财经' },
    { title: '如何度过20多岁这个迷茫期', heat: '7200万', category: '职场' },
    { title: '人工智能时代什么能力最重要', heat: '7000万', category: '科技' },
    { title: '为什么年轻人越来越反感「人情世故」', heat: '6800万', category: '社会' },
    { title: '有哪些实用的人际交往小技巧', heat: '6500万', category: '职场' },
    { title: '普通人如何提升审美', heat: '6200万', category: '生活' },
    { title: '你心中最温暖的一句话是什么', heat: '6000万', category: '情感' },
  ],
};

// -----------------------------------------------
// 组件
// -----------------------------------------------
export default function HotTopicsPage() {
  useSEO('热点追踪');
  const router = useRouter();
  const [activePlatform, setActivePlatform] = useState(platforms[0]);
  const [topicData, setTopicData] = useState<Record<string, { title: string; heat: string; category: string }[]>>({});
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchHotData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/hot');
      if (res.ok) {
        const data = await res.json();
        if (data.data && Object.keys(data.data).length > 0) {
          setTopicData(data.data);
          setLoading(false);
          return;
        }
      }
      // Fallback to static data if API fails
      setTopicData(FALLBACK_TOPICS);
    } catch (e) {
      console.warn('[hot-topics] API failed, using fallback:', e);
      setTopicData(FALLBACK_TOPICS);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchHotData();
  }, []);

  const topics = topicData[activePlatform] || [];
  const totalCount = Object.values(topicData).flat().length;

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Flame size={22} className="text-rose-400" />
            热点追踪
          </h1>
          <p className="text-[var(--color-text-secondary)] mt-1">
            AI 一键改写 · 每日自动轮换
          </p>
        </div>
        <button
          onClick={fetchHotData}
          disabled={loading}
          className="btn-secondary text-xs px-3 py-1.5"
        >
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
          刷新
        </button>
      </div>

      {/* Loading state */}


      {/* Loading skeleton */}
      {loading ? (
        <div className="glass-card p-5">
          <div className="flex flex-col items-center justify-center py-12 text-[var(--color-text-secondary)] gap-3">
            <Loader2 size={28} className="animate-spin text-rose-400" />
            <span className="text-sm">正在获取全网热点...</span>
          </div>
        </div>
      ) : (
        <>
          {/* 统计标签 */}
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-3">
              <span className="text-lg font-bold">实时热点</span>
              <span className="text-xs text-[var(--color-text-secondary)]">
                {new Date().toLocaleDateString('zh-CN')}
              </span>
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
            {topics.length === 0 ? (
              <div className="col-span-full text-center py-12 text-[var(--color-text-secondary)]">
                <Flame size={40} className="mx-auto opacity-30 mb-2" />
                <p>该平台暂无热点数据</p>
              </div>
            ) : (
              topics.map((topic, i) => (
                <div key={`${activePlatform}-${i}`} className="glass-card p-4 glass-card-hover group">
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
                        {topic.category && (
                          <span className="text-[11px] text-[var(--color-text-secondary)]">{topic.category}</span>
                        )}
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
                            setCopiedId(`${activePlatform}-${i}`);
                            navigator.clipboard.writeText(topic.title);
                            setTimeout(() => setCopiedId(null), 2000);
                          }}
                          className="text-xs text-[var(--color-text-secondary)] hover:text-text transition-colors flex items-center gap-1"
                        >
                          {copiedId === `${activePlatform}-${i}` ? <><Check size={10} className="text-emerald-400" /> 已复制</> : <>复制标题</>}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
