import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// 预设主题
const THEMES = [
  { id: 'sharing', label: '学会分享', emoji: '🤝', image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400' },
  { id: 'brave', label: '勇敢面对', emoji: '💪', image: 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=400' },
  { id: 'honest', label: '诚实守信', emoji: '🌟', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400' },
  { id: 'polite', label: '礼貌待人', emoji: '🙏', image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=400' },
  { id: 'environment', label: '爱护环境', emoji: '🌱', image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400' },
  { id: 'friendship', label: '珍惜友谊', emoji: '💕', image: 'https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?w=400' },
];

// 预设动物
const ANIMALS = [
  { id: 'rabbit', label: '小兔子', emoji: '🐰' },
  { id: 'bear', label: '小熊', emoji: '🐻' },
  { id: 'cat', label: '小猫咪', emoji: '🐱' },
  { id: 'dog', label: '小狗狗', emoji: '🐶' },
  { id: 'elephant', label: '小象', emoji: '🐘' },
  { id: 'panda', label: '熊猫', emoji: '🐼' },
];

// Workflow 步骤
const WORKFLOW_STEPS = [
  { id: 'educator', name: '教育专家', emoji: '📚', description: '正在分析适合孩子的教育目标...' },
  { id: 'parallel', name: '创作团队', emoji: '✨', description: '故事作家、插画师、游戏设计师协作中...' },
  { id: 'safety', name: '安全审核', emoji: '🛡️', description: '确保内容适合儿童阅读...' },
  { id: 'narrator', name: '故事整合', emoji: '🎙️', description: '正在润色和整合最终故事...' },
];

function StoryWorkshopPage() {
  const [formData, setFormData] = useState({
    childName: '',
    childAge: 4,
    theme: '',
    favoriteAnimal: '',
  });
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [story, setStory] = useState(null);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(true);
  const [progressPercent, setProgressPercent] = useState(0);
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    setFadeIn(true);
  }, []);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const generateStory = async () => {
    if (!formData.childName || !formData.theme || !formData.favoriteAnimal) {
      setError('请填写所有信息哦~');
      return;
    }

    setLoading(true);
    setError(null);
    setStory(null);
    setShowForm(false);
    setCurrentStep('educator');
    setCurrentStepIndex(0);
    setProgressPercent(0);

    try {
      const steps = ['educator', 'parallel', 'safety', 'narrator'];
      let stepIndex = 0;

      // 动画进度
      const progressInterval = setInterval(() => {
        setProgressPercent(prev => {
          if (prev >= 100) return 100;
          return prev + 0.5;
        });
      }, 50);

      const stepInterval = setInterval(() => {
        stepIndex++;
        if (stepIndex < steps.length) {
          setCurrentStep(steps[stepIndex]);
          setCurrentStepIndex(stepIndex);
        }
      }, 3000);

      const response = await fetch('/api/story-workshop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          theme: THEMES.find(t => t.id === formData.theme)?.label || formData.theme,
          childName: formData.childName,
          childAge: formData.childAge,
          favoriteAnimal: ANIMALS.find(a => a.id === formData.favoriteAnimal)?.label || formData.favoriteAnimal,
        }),
      });

      clearInterval(progressInterval);
      clearInterval(stepInterval);
      setProgressPercent(100);

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      // 延迟显示结果，让进度条完成
      setTimeout(() => {
        setStory(data.story);
        setCurrentStep(null);
        setLoading(false);
      }, 500);

    } catch (err) {
      setError(err.message);
      setShowForm(true);
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStory(null);
    setError(null);
    setCurrentStep(null);
    setShowForm(true);
    setProgressPercent(0);
  };

  const selectedTheme = THEMES.find(t => t.id === formData.theme);

  return (
    <div className={`explorer-page ${fadeIn ? 'fade-in' : ''}`}>
      {/* 导航栏 */}
      <nav className="explorer-nav">
        <Link to="/" className="explorer-logo">Storyteller</Link>
        <button className="explorer-menu">
          <span></span>
          <span></span>
          <span></span>
        </button>
      </nav>

      {/* 主内容 */}
      <div className="explorer-content">
        {/* 左侧大图 */}
        <div className="explorer-hero">
          <div
            className="hero-image"
            style={{
              backgroundImage: selectedTheme
                ? `url(${selectedTheme.image})`
                : 'url(https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800)'
            }}
          >
            <div className="hero-overlay"></div>
            {loading && (
              <div className="hero-loading">
                <div className="loading-ring">
                  <div className="ring-progress" style={{ '--progress': `${progressPercent}%` }}></div>
                </div>
                <span className="loading-percent">{Math.round(progressPercent)}%</span>
              </div>
            )}
          </div>
          <div className="hero-nav">
            <button className="hero-nav-btn prev">‹</button>
            <button className="hero-nav-btn next">›</button>
          </div>
        </div>

        {/* 右侧内容 */}
        <div className="explorer-main">
          {showForm && !story ? (
            <div className="form-container slide-in">
              <h1 className="explorer-title">
                BECOME A STORY PRO IN
                <br />
                ONE EASY LESSON.
              </h1>

              <div className="author-info">
                <div className="author-avatar">✨</div>
                <div className="author-text">
                  <span className="author-name">AI Story Workshop</span>
                  <span className="author-role">Multi-Agent Storyteller</span>
                </div>
              </div>

              <p className="explorer-desc">
                输入孩子的信息，我们的 AI 创作团队将协作为您的孩子创作一个专属的教育故事。
                每个故事都经过教育专家设计、创意团队打磨、安全审核确认。
              </p>

              {/* 表单 */}
              <div className="explorer-form">
                <div className="form-row">
                  <div className="form-field">
                    <label>孩子的名字</label>
                    <input
                      type="text"
                      placeholder="请输入名字"
                      value={formData.childName}
                      onChange={(e) => handleInputChange('childName', e.target.value)}
                      className="explorer-input"
                    />
                  </div>
                  <div className="form-field">
                    <label>年龄</label>
                    <div className="age-buttons">
                      {[3, 4, 5, 6, 7].map(age => (
                        <button
                          key={age}
                          className={`age-btn ${formData.childAge === age ? 'active' : ''}`}
                          onClick={() => handleInputChange('childAge', age)}
                        >
                          {age}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 主题选择 - 图片卡片 */}
                <div className="form-field">
                  <label>选择教育主题</label>
                  <div className="theme-gallery">
                    {THEMES.map((theme, index) => (
                      <div
                        key={theme.id}
                        className={`theme-card ${formData.theme === theme.id ? 'active' : ''}`}
                        onClick={() => handleInputChange('theme', theme.id)}
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <div
                          className="theme-image"
                          style={{ backgroundImage: `url(${theme.image})` }}
                        >
                          {formData.theme === theme.id && (
                            <div className="theme-check">
                              <span className="play-icon">▶</span>
                            </div>
                          )}
                        </div>
                        <span className="theme-label">{theme.emoji} {theme.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 动物选择 */}
                <div className="form-field">
                  <label>喜欢的动物角色</label>
                  <div className="animal-pills">
                    {ANIMALS.map(animal => (
                      <button
                        key={animal.id}
                        className={`animal-pill ${formData.favoriteAnimal === animal.id ? 'active' : ''}`}
                        onClick={() => handleInputChange('favoriteAnimal', animal.id)}
                      >
                        <span className="animal-emoji">{animal.emoji}</span>
                        <span className="animal-name">{animal.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {error && <div className="explorer-error">{error}</div>}

                <button className="explorer-btn" onClick={generateStory}>
                  开始创作故事 →
                </button>
              </div>
            </div>
          ) : loading ? (
            /* 加载中状态 */
            <div className="loading-container fade-in">
              <h2 className="loading-title">AI 创作团队工作中</h2>
              <p className="loading-subtitle">正在为 {formData.childName} 创作专属故事...</p>

              <div className="workflow-timeline">
                {WORKFLOW_STEPS.map((step, index) => (
                  <div
                    key={step.id}
                    className={`timeline-item ${index <= currentStepIndex ? 'active' : ''} ${index < currentStepIndex ? 'done' : ''}`}
                    style={{ animationDelay: `${index * 0.2}s` }}
                  >
                    <div className="timeline-dot">
                      {index < currentStepIndex ? '✓' : step.emoji}
                    </div>
                    <div className="timeline-content">
                      <span className="timeline-name">{step.name}</span>
                      <span className="timeline-desc">{step.description}</span>
                    </div>
                    {index === currentStepIndex && (
                      <div className="timeline-spinner"></div>
                    )}
                  </div>
                ))}
              </div>

              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
            </div>
          ) : story ? (
            /* 故事结果 */
            <div className="story-container fade-in">
              <div className="story-header-section">
                <h1 className="story-title">{story.story?.title || '专属故事'}</h1>
                <div className="story-meta-row">
                  <div className="author-info">
                    <div className="author-avatar">{ANIMALS.find(a => a.label === story.favoriteAnimal)?.emoji || '📖'}</div>
                    <div className="author-text">
                      <span className="author-name">{story.childName}的专属故事</span>
                      <span className="author-role">{story.childAge}岁 · {story.theme}</span>
                    </div>
                  </div>
                  <button className="bookmark-btn">🔖</button>
                </div>
              </div>

              <p className="story-intro">
                {story.narration?.openingLine || '从前，在一个美丽的地方...'}
              </p>

              {/* 章节卡片 */}
              <div className="chapter-gallery">
                {story.story?.chapters?.map((chapter, index) => (
                  <div
                    key={index}
                    className="chapter-card"
                    style={{ animationDelay: `${index * 0.15}s` }}
                  >
                    <div
                      className="chapter-image"
                      style={{
                        backgroundImage: `url(${THEMES.find(t => t.label === story.theme)?.image || THEMES[index % THEMES.length].image})`
                      }}
                    >
                      <span className="chapter-number">Chapter {index + 1}</span>
                    </div>
                    <div className="chapter-content">
                      <h4>{chapter.title}</h4>
                      <p>{chapter.content}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* 互动问答 */}
              {story.interactions?.interactions && (
                <div className="interaction-section">
                  <h3>🎮 互动问答</h3>
                  {story.interactions.interactions.map((item, index) => (
                    <div key={index} className="qa-card">
                      <p className="qa-question">{item.question}</p>
                      <div className="qa-options">
                        {item.options?.map((option, i) => (
                          <button
                            key={i}
                            className={`qa-option ${i === item.correctAnswer ? 'correct' : ''}`}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 结尾 */}
              {story.narration?.closingLine && (
                <p className="story-ending">"{story.narration.closingLine}"</p>
              )}

              {/* 操作按钮 */}
              <div className="story-actions-row">
                <button className="action-btn-dark" onClick={resetForm}>
                  创作新故事
                </button>
                <button className="action-btn-light" onClick={() => window.print()}>
                  打印故事
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default StoryWorkshopPage;
