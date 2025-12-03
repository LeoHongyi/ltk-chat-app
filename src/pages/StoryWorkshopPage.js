import { useState } from 'react';
import { Link } from 'react-router-dom';

// 预设主题
const THEMES = [
  { id: 'sharing', label: '学会分享', emoji: '🤝' },
  { id: 'brave', label: '勇敢面对', emoji: '💪' },
  { id: 'honest', label: '诚实守信', emoji: '🌟' },
  { id: 'polite', label: '礼貌待人', emoji: '🙏' },
  { id: 'environment', label: '爱护环境', emoji: '🌱' },
  { id: 'friendship', label: '珍惜友谊', emoji: '💕' },
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
  { id: 'educator', name: '教育专家', emoji: '📚', description: '分析教育目标' },
  { id: 'parallel', name: '创作团队', emoji: '✨', description: '故事、场景、互动设计' },
  { id: 'safety', name: '安全审核', emoji: '🛡️', description: '内容安全检查' },
  { id: 'narrator', name: '故事整合', emoji: '🎙️', description: '生成最终故事' },
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
  const [story, setStory] = useState(null);
  const [error, setError] = useState(null);

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
    setCurrentStep('educator');

    try {
      // 模拟步骤进度
      const steps = ['educator', 'parallel', 'safety', 'narrator'];
      let stepIndex = 0;

      const progressInterval = setInterval(() => {
        stepIndex++;
        if (stepIndex < steps.length) {
          setCurrentStep(steps[stepIndex]);
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

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setStory(data.story);
      setCurrentStep(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStory(null);
    setError(null);
    setCurrentStep(null);
  };

  return (
    <div className="story-workshop-page">
      {/* 导航 */}
      <nav className="nav">
        <div className="nav-left">
          <Link to="/" className="nav-circle">←</Link>
          <span className="nav-page">故事创作工坊</span>
        </div>
        <div className="nav-right">
          <span className="nav-badge">Multi-Agent Workflow</span>
        </div>
      </nav>

      {/* 主内容 */}
      <div className="workshop-container">
        {!story ? (
          <>
            {/* 表单区域 */}
            <div className="workshop-form-card">
              <div className="form-header">
                <h1>✨ AI 儿童故事创作工坊</h1>
                <p>输入孩子的信息，AI 团队将协作创作专属教育故事</p>
              </div>

              <div className="form-body">
                {/* 孩子名字 */}
                <div className="form-group">
                  <label>孩子的名字</label>
                  <input
                    type="text"
                    placeholder="例如：小明"
                    value={formData.childName}
                    onChange={(e) => handleInputChange('childName', e.target.value)}
                    disabled={loading}
                  />
                </div>

                {/* 年龄 */}
                <div className="form-group">
                  <label>孩子的年龄</label>
                  <div className="age-selector">
                    {[3, 4, 5, 6, 7].map(age => (
                      <button
                        key={age}
                        className={`age-btn ${formData.childAge === age ? 'active' : ''}`}
                        onClick={() => handleInputChange('childAge', age)}
                        disabled={loading}
                      >
                        {age}岁
                      </button>
                    ))}
                  </div>
                </div>

                {/* 教育主题 */}
                <div className="form-group">
                  <label>教育主题</label>
                  <div className="theme-grid">
                    {THEMES.map(theme => (
                      <button
                        key={theme.id}
                        className={`theme-btn ${formData.theme === theme.id ? 'active' : ''}`}
                        onClick={() => handleInputChange('theme', theme.id)}
                        disabled={loading}
                      >
                        <span className="theme-emoji">{theme.emoji}</span>
                        <span className="theme-label">{theme.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 喜欢的动物 */}
                <div className="form-group">
                  <label>喜欢的动物</label>
                  <div className="animal-grid">
                    {ANIMALS.map(animal => (
                      <button
                        key={animal.id}
                        className={`animal-btn ${formData.favoriteAnimal === animal.id ? 'active' : ''}`}
                        onClick={() => handleInputChange('favoriteAnimal', animal.id)}
                        disabled={loading}
                      >
                        <span className="animal-emoji">{animal.emoji}</span>
                        <span className="animal-label">{animal.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {error && <div className="form-error">{error}</div>}

                <button
                  className="generate-btn"
                  onClick={generateStory}
                  disabled={loading}
                >
                  {loading ? '创作中...' : '开始创作故事 ✨'}
                </button>
              </div>
            </div>

            {/* Workflow 进度 */}
            {loading && (
              <div className="workflow-progress">
                <h3>AI 创作团队工作中...</h3>
                <div className="workflow-steps">
                  {WORKFLOW_STEPS.map((step, index) => {
                    const stepIndex = WORKFLOW_STEPS.findIndex(s => s.id === currentStep);
                    const isActive = step.id === currentStep;
                    const isDone = index < stepIndex;

                    return (
                      <div
                        key={step.id}
                        className={`workflow-step ${isActive ? 'active' : ''} ${isDone ? 'done' : ''}`}
                      >
                        <div className="step-icon">
                          {isDone ? '✓' : step.emoji}
                        </div>
                        <div className="step-info">
                          <span className="step-name">{step.name}</span>
                          <span className="step-desc">{step.description}</span>
                        </div>
                        {isActive && <div className="step-loading"></div>}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        ) : (
          /* 故事展示 */
          <div className="story-result">
            <div className="story-header">
              <h1>{story.story?.title || '专属故事'}</h1>
              <p>为 {story.childName}（{story.childAge}岁）创作</p>
              <div className="story-meta">
                <span className="meta-item">📚 主题：{story.theme}</span>
                <span className="meta-item">🐾 角色：{story.favoriteAnimal}</span>
                <span className="meta-item">⏱️ 阅读时间：{story.narration?.readingTime || '3-5'}分钟</span>
              </div>
            </div>

            {/* 教育目标 */}
            <div className="story-section goals-section">
              <h3>🎯 教育目标</h3>
              <div className="goals-list">
                {story.educationGoals?.goals?.map((goal, i) => (
                  <span key={i} className="goal-tag">{goal}</span>
                ))}
              </div>
              {story.educationGoals?.values && (
                <p className="values-text">
                  价值观：{story.educationGoals.values.join('、')}
                </p>
              )}
            </div>

            {/* 故事内容 */}
            <div className="story-section content-section">
              <h3>📖 故事内容</h3>
              {story.narration?.openingLine && (
                <div className="opening-line">
                  "{story.narration.openingLine}"
                </div>
              )}
              {story.story?.chapters?.map((chapter, index) => (
                <div key={index} className="chapter">
                  <h4>{chapter.title}</h4>
                  <p>{chapter.content}</p>
                  {story.scenes?.scenes?.[index] && (
                    <div className="scene-prompt">
                      🎨 场景：{story.scenes.scenes[index].description}
                    </div>
                  )}
                </div>
              ))}
              {story.narration?.closingLine && (
                <div className="closing-line">
                  "{story.narration.closingLine}"
                </div>
              )}
            </div>

            {/* 互动问答 */}
            {story.interactions?.interactions && (
              <div className="story-section interactions-section">
                <h3>🎮 互动问答</h3>
                {story.interactions.interactions.map((item, index) => (
                  <div key={index} className="interaction-card">
                    <p className="question">{item.question}</p>
                    <div className="options">
                      {item.options?.map((option, i) => (
                        <button
                          key={i}
                          className={`option-btn ${i === item.correctAnswer ? 'correct' : ''}`}
                        >
                          {String.fromCharCode(65 + i)}. {option}
                        </button>
                      ))}
                    </div>
                    <p className="explanation">💡 {item.explanation}</p>
                  </div>
                ))}
              </div>
            )}

            {/* 安全审核 */}
            {story.safetyReview && (
              <div className="story-section safety-section">
                <h3>🛡️ 安全审核</h3>
                <div className={`safety-badge ${story.safetyReview.approved ? 'approved' : 'warning'}`}>
                  {story.safetyReview.approved ? '✓ 内容安全' : '⚠️ 需要注意'}
                  <span className="safety-score">安全评分：{story.safetyReview.safetyScore}/10</span>
                </div>
              </div>
            )}

            {/* 操作按钮 */}
            <div className="story-actions">
              <button className="action-btn primary" onClick={resetForm}>
                创作新故事
              </button>
              <button className="action-btn secondary" onClick={() => window.print()}>
                打印故事
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default StoryWorkshopPage;
