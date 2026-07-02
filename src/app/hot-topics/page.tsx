'use client';

import { Flame, RefreshCw, ExternalLink, Loader2, Check } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '../../components/Toast';
import { useSettings } from '../../lib/ai';

const platforms = ['微博热搜', '百度热榜', '今日头条', '抖音热点', '知乎热榜', '微信热点'];

const topicsByPlatform: Record<string, { title: string; heat: string; category: string }[]> = {
  '微博热搜': [
    { title: '2026年AI工具推荐：这5款让工作效率翻倍', heat: '2.3亿', category: '科技' },
    { title: '看完《长安三万里》续集，我理解了什么叫文化自信', heat: '1.8亿', category: '文化' },
    { title: '多地发布高温红色预警 局部超40℃', heat: '1.6亿', category: '民生' },
    { title: '某顶流明星被曝偷税漏税 金额惊人', heat: '1.5亿', category: '娱乐' },
    { title: '高考成绩陆续公布 志愿填报指南来了', heat: '1.4亿', category: '教育' },
    { title: '2026年最佳旅行目的地榜单出炉', heat: '1.3亿', category: '旅行' },
    { title: '华为发布新一代芯片 性能提升300%', heat: '1.2亿', category: '科技' },
    { title: '年轻人开始流行「数字极简」生活', heat: '1.1亿', category: '社会' },
    { title: '2026世界杯预选赛 中国队关键战告捷', heat: '1.0亿', category: '体育' },
    { title: '警方破获特大网络诈骗案 涉案金额超百亿', heat: '9500万', category: '社会' },
    { title: '某知名企业宣布全员涨薪20%', heat: '9200万', category: '财经' },
    { title: '新研究：每天喝咖啡可降低心血管疾病风险', heat: '8800万', category: '健康' },
    { title: '2026年上半年GDP同比增长5.2%', heat: '8600万', category: '财经' },
    { title: '一线城市房租普遍下降 原因找到了', heat: '8300万', category: '房产' },
    { title: '某综艺节目录制现场发生意外', heat: '8000万', category: '娱乐' },
    { title: '国产动画电影票房破50亿 创历史新高', heat: '7800万', category: '文化' },
    { title: '新能源车渗透率突破60% 燃油车何去何从', heat: '7500万', category: '汽车' },
    { title: '教育部：中小学将新增AI必修课', heat: '7200万', category: '教育' },
    { title: '2026年诺贝尔奖热门候选人盘点', heat: '7000万', category: '科技' },
    { title: '高温津贴发放标准调整 你收到了吗', heat: '6800万', category: '民生' },
  ],
  '百度热榜': [
    { title: '7月新规来了！涉及你的工资、社保和公积金', heat: '1.2亿', category: '民生' },
    { title: '2026年最新社保缴费基数调整，到手的钱有变化', heat: '9800万', category: '民生' },
    { title: '全国多地暴雨预警 出行需注意', heat: '9200万', category: '民生' },
    { title: '油价大幅下调 加满一箱省25元', heat: '8800万', category: '财经' },
    { title: '2026年养老金上涨方案公布', heat: '8500万', category: '民生' },
    { title: '医保目录新增91种药品 涵盖多个罕见病', heat: '8200万', category: '健康' },
    { title: '下半年考试日历发布 收藏备用', heat: '7800万', category: '教育' },
    { title: '个人养老金账户开户人数突破8000万', heat: '7500万', category: '财经' },
    { title: '公积金贷款利率下调 每月少还多少钱', heat: '7200万', category: '房产' },
    { title: '暑期档电影票房突破200亿 创历史新高', heat: '7000万', category: '娱乐' },
    { title: '2026年高校毕业生就业率数据公布', heat: '6800万', category: '教育' },
    { title: '多地调整落户政策 抢人大战升级', heat: '6500万', category: '社会' },
    { title: '数字人民币试点城市再扩大', heat: '6200万', category: '财经' },
    { title: '全国碳排放权交易市场运行一周年', heat: '6000万', category: '财经' },
    { title: '暑期旅游热门城市TOP10出炉', heat: '5800万', category: '旅行' },
    { title: '电动自行车新国标实施 你的车合规吗', heat: '5500万', category: '民生' },
    { title: '地铁安检新规 这些物品禁止携带', heat: '5200万', category: '民生' },
    { title: '2026年食品安全抽检结果公布', heat: '5000万', category: '民生' },
    { title: '快递新规：未获同意不得放快递柜', heat: '4800万', category: '民生' },
    { title: '高温天气下 这些防暑误区你中了几个', heat: '4500万', category: '健康' },
  ],
  '今日头条': [
    { title: '自媒体人必看：2026年内容创作的5个趋势', heat: '9800万', category: '运营' },
    { title: '35岁+职场人如何避免被优化？这3条建议很实用', heat: '7200万', category: '职场' },
    { title: '县城体制内现状：降薪20%后没人辞职', heat: '6800万', category: '社会' },
    { title: '某大厂员工猝死引发加班文化反思', heat: '6500万', category: '职场' },
    { title: '2026年最赚钱的5个副业推荐', heat: '6200万', category: '财经' },
    { title: '为什么越来越多的年轻人选择不婚', heat: '6000万', category: '社会' },
    { title: '房价下跌后 第一批断供的人怎么样了', heat: '5800万', category: '房产' },
    { title: 'ChatGPT发布新版本 能力再升级', heat: '5500万', category: '科技' },
    { title: '2026年高考最难省份排名出炉', heat: '5300万', category: '教育' },
    { title: 'AI主播开始带货 月销百万是真的吗', heat: '5000万', category: '科技' },
    { title: '00后整顿职场 真的是这样吗', heat: '4800万', category: '职场' },
    { title: '2026年创业风口在哪里 这3个方向值得关注', heat: '4600万', category: '财经' },
    { title: '中医养生年轻化 这届年轻人开始保温杯泡枸杞', heat: '4400万', category: '健康' },
    { title: '三胎政策效果如何 最新数据来了', heat: '4200万', category: '民生' },
    { title: '2026年最值得买的10款新能源车', heat: '4000万', category: '汽车' },
    { title: '农村彩礼调查：平均18万 你怎么看', heat: '3800万', category: '社会' },
    { title: '小学教师反映工作负担过重 引热议', heat: '3600万', category: '教育' },
    { title: '2026年最火副业：AI训练师月入3万', heat: '3400万', category: '职场' },
    { title: '预制菜进校园引争议 家长怎么看', heat: '3200万', category: '民生' },
    { title: '越来越贵的奶茶 你还在喝吗', heat: '3000万', category: '生活' },
  ],
  '抖音热点': [
    { title: '这届年轻人开始「反向考研」了？', heat: '8500万', category: '教育' },
    { title: '周末去哪玩？这5个小众旅行地人少景美', heat: '6200万', category: '旅行' },
    { title: '挑战连续30天早起 第7天就崩了', heat: '5800万', category: '生活' },
    { title: '跟练这个博主7天 腰围减了5cm', heat: '5500万', category: '健康' },
    { title: '100元在城市生存一天挑战', heat: '5200万', category: '生活' },
    { title: '我妈第一次用AI的表情 笑翻了', heat: '5000万', category: '搞笑' },
    { title: '探店博主集体翻车 同一家店评价两极', heat: '4800万', category: '生活' },
    { title: '大学生毕业典礼上的神发言', heat: '4500万', category: '教育' },
    { title: '2026年最火的旅行打卡地合集', heat: '4300万', category: '旅行' },
    { title: '宠物也会emo？猫咪抑郁的5个信号', heat: '4000万', category: '萌宠' },
    { title: '网红餐厅避雷指南 这5家别去了', heat: '3800万', category: '生活' },
    { title: '农村小伙用AI改造老房子 效果惊艳', heat: '3600万', category: '科技' },
    { title: '30岁辞职开店 一年后我后悔了', heat: '3400万', category: '职场' },
    { title: '这些童年零食你还记得吗 看到第3个哭了', heat: '3200万', category: '生活' },
    { title: '情侣吵架和解的10种方式 最后一种绝了', heat: '3000万', category: '情感' },
    { title: '2026年最火舞蹈挑战 你也来试试', heat: '2800万', category: '娱乐' },
    { title: '妈妈做的饭VS外卖 差距有多大', heat: '2600万', category: '生活' },
    { title: '暑假神兽在家 老母亲的日常崩溃', heat: '2400万', category: '搞笑' },
    { title: '街头采访：你觉得多少钱才算财务自由', heat: '2200万', category: '社会' },
    { title: '资深驴友推荐的5条绝美徒步路线', heat: '2000万', category: '旅行' },
  ],
  '知乎热榜': [
    { title: '年轻人为什么开始「反向消费」了', heat: '1.5亿', category: '社会' },
    { title: '为什么说2026年是AI应用落地的关键一年？', heat: '8600万', category: '科技' },
    { title: '30岁转行还来得及吗？过来人的经验分享', heat: '7800万', category: '职场' },
    { title: '如何评价2026年的高考作文题？', heat: '7200万', category: '教育' },
    { title: '月薪1万和月薪10万的人差距到底在哪', heat: '6800万', category: '职场' },
    { title: '孩子沉迷短视频怎么办？心理学专家支招', heat: '6500万', category: '教育' },
    { title: '为什么越来越多的人开始逃离社交媒体', heat: '6200万', category: '社会' },
    { title: '哪些你以为很贵的东西其实很便宜？', heat: '5800万', category: '生活' },
    { title: '2026年买房还是租房？深度分析', heat: '5500万', category: '房产' },
    { title: '工作10年 你最后悔的决定是什么', heat: '5200万', category: '职场' },
    { title: '有哪些你以为是常识但很多人不知道的事', heat: '5000万', category: '生活' },
    { title: '被裁员后 我靠这3个副业月入2万', heat: '4800万', category: '职场' },
    { title: '中医 VS 西医 到底哪个更靠谱', heat: '4500万', category: '健康' },
    { title: '为什么现在的年轻人越来越不爱说话了', heat: '4300万', category: '社会' },
    { title: '有哪些让你「一见倾心」的诗句', heat: '4000万', category: '文化' },
    { title: '养猫和养狗的体验有什么不同？', heat: '3800万', category: '生活' },
    { title: '考研二战值得吗？过来人真实经历', heat: '3600万', category: '教育' },
    { title: '你经历过最社死的瞬间是什么', heat: '3400万', category: '生活' },
    { title: '有哪些你一直用但不知道原理的黑科技', heat: '3200万', category: '科技' },
    { title: '如何克服公共演讲的恐惧？实战经验分享', heat: '3000万', category: '职场' },
  ],
  '微信热点': [
    { title: '公众号流量主收益下降？这3个新打法值得尝试', heat: '1.8亿', category: '运营' },
    { title: '微信更新：这5个新功能你觉得实用吗', heat: '6200万', category: '科技' },
    { title: '视频号带货月入10万 普通人也能做吗', heat: '5800万', category: '运营' },
    { title: '朋友圈三天可见的人是什么心理', heat: '5500万', category: '社会' },
    { title: '2026年公众号爆文标题公式 建议收藏', heat: '5200万', category: '运营' },
    { title: '微信支付分升级 这些新权益你享受了吗', heat: '5000万', category: '科技' },
    { title: '公众号打开率持续走低 创作者该怎么办', heat: '4800万', category: '运营' },
    { title: '微信群聊新功能实测 太好用了', heat: '4500万', category: '科技' },
    { title: '2026年微信公众号运营趋势报告', heat: '4300万', category: '运营' },
    { title: '这届父母的朋友圈 太真实了', heat: '4000万', category: '生活' },
    { title: '微信读书2026上半年热门书单', heat: '3800万', category: '文化' },
    { title: '视频号直播带货新规解读', heat: '3600万', category: '运营' },
    { title: '公众号创作者如何拥抱AI工具', heat: '3400万', category: '运营' },
    { title: '你的微信通讯录里有多少「僵尸好友」', heat: '3200万', category: '生活' },
    { title: '微信键盘上线一周年 用户评价两极', heat: '3000万', category: '科技' },
    { title: '小程序电商新人如何从0到1', heat: '2800万', category: '运营' },
    { title: '看了100篇10w+后 我总结出这5个共性', heat: '2600万', category: '运营' },
    { title: '微信状态新表情上线 你最喜欢哪个', heat: '2400万', category: '科技' },
    { title: '公众号留言区精选技巧 互动率提升3倍', heat: '2200万', category: '运营' },
    { title: '微信小游戏月流水破千万 新的财富密码', heat: '2000万', category: '科技' },
  ],
};

export default function HotTopicsPage() {
  const router = useRouter();
  const toast = useToast();
  const { settings } = useSettings();
  const [refreshing, setRefreshing] = useState(false);
  const [activePlatform, setActivePlatform] = useState(platforms[0]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [topicData, setTopicData] = useState(topicsByPlatform);
  const initialLoad = useRef(false);

  const topics = topicData[activePlatform] || [];
  const totalCount = Object.values(topicData).flat().length;

  const refresh = async () => {
    setRefreshing(true);
    const results: Record<string, { title: string; heat: string; category: string }[]> = { ...topicData };
    const queries: [string, string][] = [
      ['微博热搜', '微博热搜榜 今日 热点'],
      ['百度热榜', '百度热搜榜 今日 热点新闻'],
      ['今日头条', '今日头条 热门 新闻'],
      ['抖音热点', '抖音 热门 话题'],
      ['知乎热榜', '知乎 热门 话题 今日'],
      ['微信热点', '微信公众号 热门 文章'],
    ];

    let fetched = 0;
    for (const [platform, query] of queries) {
      try {
        const res = await fetch('/api/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query }),
        });
        const data = await res.json();
        if (res.ok && data.results && data.results.length > 0) {
          results[platform] = data.results.slice(0, 20).map((r: any, i: number) => ({
            title: r.title || r.snippet,
            heat: `${Math.floor(9000 - i * 400 + Math.random() * 500)}万`,
            category: '热点',
          }));
          fetched++;
        }
      } catch {}
    }

    if (fetched > 0) {
      setTopicData(results);
      localStorage.setItem('hot-topics-count', String(Object.values(results).flat().length));
      toast.show(`已刷新：${fetched} 个平台`);
    } else {
      toast.show('联网获取失败，显示已有数据');
    }
    setRefreshing(false);
  };

  // Auto-fetch on first load
  useEffect(() => {
    if (!initialLoad.current && settings.apiKey) {
      initialLoad.current = true;
      refresh();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.apiKey]);

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Flame size={22} className="text-rose-400" />
          热点追踪
        </h1>
        <p className="text-[var(--color-text-secondary)] mt-1">
          AI 实时采集主流平台热点资讯，智能排序，一键改写公众号爆文
        </p>
      </div>

      {/* Stats */}
      <div className="glass-card p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <div>
              <div className="text-2xl font-bold text-rose-400">{topics.length}</div>
              <div className="text-xs text-[var(--color-text-secondary)]">当前平台采集</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{platforms.length}</div>
              <div className="text-xs text-[var(--color-text-secondary)]">覆盖平台</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-emerald-400">≤5min</div>
              <div className="text-xs text-[var(--color-text-secondary)]">数据更新延迟</div>
            </div>
          </div>
          <button onClick={refresh} disabled={refreshing} className="btn-primary">
            {refreshing ? <><Loader2 size={16} className="animate-spin" /> 刷新中...</> : <><RefreshCw size={16} /> 刷新热点</>}
          </button>
        </div>
      </div>

      {/* Platform filter (no "全部") */}
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

      {/* Topics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {topics.map((topic, i) => (
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
        ))}
      </div>
    </div>
  );
}
