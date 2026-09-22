'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  Check,
  ChevronRight,
  CircleHelp,
  FileImage,
  FileUp,
  Info,
  Moon,
  RotateCcw,
  ScanLine,
  ShieldCheck,
  Sun,
  Upload,
  X,
  Zap,
} from 'lucide-react'

const API_URL = 'http://127.0.0.1:5000'

const protocols = [
  {
    label: 'CXR PA & Lateral',
    value: 'Recommended',
    active: true,
  },
  {
    label: 'Portable AP',
    value: 'Not selected',
    active: false,
  },
  {
    label: 'Pediatric chest',
    value: 'Not selected',
    active: false,
  },
]

type PredictionResult = {
  class_id: number
  class_name: 'Normal' | 'Pneumonia'
  pneumonia_probability: number
  threshold: number
}

export default function Page() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)

  const [dragging, setDragging] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [progress, setProgress] = useState(0)

  const [analyzed, setAnalyzed] = useState(false)

  const [result, setResult] = useState<PredictionResult | null>(null)

  const [error, setError] = useState<string | null>(null)

  const [dark, setDark] = useState(true)

  const inputRef = useRef<HTMLInputElement>(null)

  const selectFile = useCallback(
    (selected: File | undefined) => {
      if (!selected || !selected.type.startsWith('image/')) {
        setError('Please select a valid image file.')
        return
      }

      if (selected.size > 25 * 1024 * 1024) {
        setError('File size must be less than 25 MB.')
        return
      }

      if (preview) {
        URL.revokeObjectURL(preview)
      }

      setFile(selected)
      setPreview(URL.createObjectURL(selected))

      setAnalyzed(false)
      setAnalyzing(false)
      setProgress(0)

      setResult(null)
      setError(null)
    },
    [preview],
  )

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview)
      }
    }
  }, [preview])

  const reset = () => {
    if (preview) {
      URL.revokeObjectURL(preview)
    }

    setFile(null)
    setPreview(null)

    setAnalyzed(false)
    setAnalyzing(false)

    setProgress(0)

    setResult(null)
    setError(null)

    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  const analyze = async () => {
    if (!file || analyzing) {
      return
    }

    setAnalyzing(true)
    setAnalyzed(false)
    setResult(null)
    setError(null)
    setProgress(10)

    try {
      const formData = new FormData()

      formData.append('file', file)

      setProgress(30)

      const response = await fetch(`${API_URL}/predict`, {
        method: 'POST',
        body: formData,
      })

      setProgress(70)

      if (!response.ok) {
        let message = 'Prediction request failed.'

        try {
          const errorData = await response.json()

          if (errorData.error) {
            message = errorData.error
          }
        } catch {
          // Ignore JSON parsing error
        }

        throw new Error(message)
      }

      const data: PredictionResult = await response.json()

      setProgress(100)

      setResult(data)
      setAnalyzed(true)
    } catch (err) {
      console.error('Prediction error:', err)

      if (err instanceof TypeError) {
        setError(
          'Unable to connect to the AI backend. Make sure the Flask server is running on port 5000.',
        )
      } else if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('An unexpected error occurred.')
      }

      setAnalyzed(false)
    } finally {
      setAnalyzing(false)
    }
  }

  const pneumoniaProbability =
    result?.pneumonia_probability ?? 0

  const confidence =
    result
      ? result.class_id === 1
        ? pneumoniaProbability * 100
        : (1 - pneumoniaProbability) * 100
      : 0

  const isPneumonia =
    result?.class_id === 1

  return (
    <main className={dark ? 'workspace dark' : 'workspace'}>
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">
            <ScanLine size={20} />
          </div>

          <div>
            <div className="brand-name">
              PulmoScan <span>AI</span>
            </div>

            <div className="brand-sub">
              Clinical imaging intelligence
            </div>
          </div>
        </div>

        <div className="top-actions">
          <div className="secure">
            <ShieldCheck size={15} />
            HIPAA-ready workspace
          </div>

          <button
            className="icon-button"
            onClick={() => setDark(!dark)}
            aria-label="Toggle color theme"
          >
            {dark ? <Sun size={17} /> : <Moon size={17} />}
          </button>

          <div className="avatar">DR</div>
        </div>
      </header>

      <section className="intro">
        <div>
          <div className="eyebrow">
            <span className="pulse" />
            LIVE ANALYSIS CONSOLE
          </div>

          <h1>
            Chest X-ray <em>intelligence.</em>
          </h1>

          <p>
            Upload an image to screen for key pulmonary findings
            with transparent, clinically grounded AI assistance.
          </p>
        </div>

        <div className="model-badge">
          <Zap size={15} />

          <span>
            Model <strong>DenseNet121</strong>
          </span>

          <span className="model-dot" />
        </div>
      </section>

      <div className="dashboard-grid">
        <section className="panel upload-panel">
          <div className="panel-heading">
            <div>
              <div className="section-kicker">01 / INPUT</div>
              <h2>Upload radiograph</h2>
            </div>

            <CircleHelp
              size={18}
              className="muted-icon"
            />
          </div>

          {!file ? (
            <div
              className={`dropzone ${
                dragging ? 'dragging' : ''
              }`}
              onDragEnter={(e) => {
                e.preventDefault()
                setDragging(true)
              }}
              onDragOver={(e) => {
                e.preventDefault()
              }}
              onDragLeave={() => {
                setDragging(false)
              }}
              onDrop={(e) => {
                e.preventDefault()

                setDragging(false)

                selectFile(
                  e.dataTransfer.files[0],
                )
              }}
              onClick={() =>
                inputRef.current?.click()
              }
              onKeyDown={(e) => {
                if (
                  e.key === 'Enter' ||
                  e.key === ' '
                ) {
                  inputRef.current?.click()
                }
              }}
              role="button"
              tabIndex={0}
              aria-label="Upload chest X-ray image"
            >
              <input
                ref={inputRef}
                type="file"
                accept="image/png,image/jpeg"
                hidden
                onChange={(e) =>
                  selectFile(
                    e.target.files?.[0],
                  )
                }
              />

              <div className="upload-icon">
                <Upload size={22} />
              </div>

              <h3>Drop your X-ray here</h3>

              <p>
                or <span>browse files</span> from your
                device
              </p>

              <div className="file-types">
                <span>PNG</span>
                <span>JPG</span>
                <i>•</i>
                <span>Max 25 MB</span>
              </div>
            </div>
          ) : (
            <div className="image-preview">
              <img
                src={preview ?? ''}
                alt="Uploaded chest X-ray"
              />

              <div className="image-overlay">
                <span>
                  <FileImage size={15} />
                  {file.name}
                </span>

                <button
                  onClick={reset}
                  aria-label="Remove image"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          )}

          {file && !analyzed && !analyzing && (
            <div className="file-meta">
              <div>
                <span className="meta-label">
                  FILE
                </span>

                <strong>{file.name}</strong>
              </div>

              <div>
                <span className="meta-label">
                  SIZE
                </span>

                <strong>
                  {(
                    file.size /
                    1024 /
                    1024
                  ).toFixed(2)}{' '}
                  MB
                </strong>
              </div>

              <div>
                <span className="meta-label">
                  STATUS
                </span>

                <strong className="ready">
                  <Check size={13} />
                  Ready
                </strong>
              </div>
            </div>
          )}

          {analyzing && (
            <div className="progress-wrap">
              <div className="progress-label">
                <span>
                  <Activity size={14} />
                  Running thoracic analysis
                </span>

                <strong>{progress}%</strong>
              </div>

              <div className="progress-track">
                <div
                  className="progress-bar"
                  style={{
                    width: `${progress}%`,
                  }}
                />
              </div>

              <p>
                Evaluating lung fields, pleura, and
                cardiomediastinal contours...
              </p>
            </div>
          )}

          {file && !analyzing && !analyzed && (
            <div
              style={{
                padding: '0 20px 20px',
              }}
            >
              <button
                className="secondary-button"
                onClick={analyze}
                style={{
                  width: '100%',
                }}
              >
                Analyze X-ray
                <ArrowUpRight size={15} />
              </button>
            </div>
          )}

          {error && (
            <div
              className="notice"
              style={{
                margin: '0 20px 20px',
              }}
            >
              <AlertTriangle size={16} />

              <div>
                <strong>
                  Analysis failed
                </strong>

                <p>{error}</p>
              </div>
            </div>
          )}

          <div className="panel-footer">
            <div className="privacy-note">
              <ShieldCheck size={14} />
              Images are encrypted in transit
            </div>

            {file &&
              !analyzing && (
                <button
                  className="text-button"
                  onClick={reset}
                >
                  <RotateCcw size={14} />
                  Replace image
                </button>
              )}
          </div>
        </section>

        <section
          className={`panel result-panel ${
            analyzed ? 'result-ready' : ''
          }`}
        >
          <div className="panel-heading">
            <div>
              <div className="section-kicker">
                02 / INSIGHT
              </div>

              <h2>Analysis result</h2>
            </div>

            {analyzed && (
              <div className="confidence-chip">
                <span className="mini-pulse" />
                Completed
              </div>
            )}
          </div>

          {!analyzed ? (
            <div className="empty-result">
              <div className="scan-visual">
                <div className="scan-ring">
                  <ScanLine size={28} />
                </div>

                <div className="scan-line" />
              </div>

              <h3>
                Awaiting image input
              </h3>

              <p>
                Your clinical insight will appear here
                after an image is analyzed.
              </p>

              <div className="empty-rule" />

              <div className="empty-meta">
                <span>Expected time</span>
                <strong>~ 8 seconds</strong>
              </div>
            </div>
          ) : (
            <div className="result-content">
              <div className="finding-label">
                PRIMARY FINDING
              </div>

              <div className="finding-row">
                <div>
                  <h3>
                    {isPneumonia
                      ? 'Pneumonia detected'
                      : 'Normal chest X-ray'}
                  </h3>

                  <p>
                    {isPneumonia
                      ? 'The DenseNet121 model classified this radiograph as Pneumonia.'
                      : 'The DenseNet121 model classified this radiograph as Normal.'}
                  </p>
                </div>

                <div className="score">
                  <strong>
                    {confidence.toFixed(1)}
                  </strong>

                  <span>
                    % confidence
                  </span>
                </div>
              </div>

              <div className="confidence-bar">
                <div
                  style={{
                    width: `${confidence}%`,
                  }}
                />
              </div>

              <div className="finding-stats">
                <div>
                  <span>
                    Classification
                  </span>

                  <strong>
                    {result?.class_name}
                  </strong>
                </div>

                <div>
                  <span>
                    Pneumonia probability
                  </span>

                  <strong>
                    {(
                      pneumoniaProbability *
                      100
                    ).toFixed(1)}
                    %
                  </strong>
                </div>

                <div>
                  <span>
                    Decision threshold
                  </span>

                  <strong>
                    {result?.threshold}
                  </strong>
                </div>
              </div>

              <div className="notice">
                <AlertTriangle size={16} />

                <div>
                  <strong>
                    Clinical review suggested
                  </strong>

                  <p>
                    This AI prediction is a
                    decision-support result and
                    should be reviewed by a
                    qualified healthcare professional
                    before clinical action.
                  </p>
                </div>
              </div>

              <button
                className="secondary-button"
                onClick={() => {
                  alert(
                    `PulmoScan AI result:\n\nClassification: ${result?.class_name}\nConfidence: ${confidence.toFixed(2)}%\nPneumonia probability: ${(pneumoniaProbability * 100).toFixed(2)}%\nThreshold: ${result?.threshold}`,
                  )
                }}
              >
                View full report
                <ArrowUpRight size={15} />
              </button>
            </div>
          )}
        </section>
      </div>

      <section className="bottom-section">
        <div className="protocol-heading">
          <div>
            <div className="section-kicker">
              ANALYSIS CONFIGURATION
            </div>

            <h2>Screening protocols</h2>
          </div>

          <span className="protocol-count">
            1 active
          </span>
        </div>

        <div className="protocol-grid">
          {protocols.map((protocol) => (
            <div
              className={`protocol ${
                protocol.active
                  ? 'active'
                  : ''
              }`}
              key={protocol.label}
            >
              <div className="protocol-icon">
                {protocol.active ? (
                  <Check size={15} />
                ) : (
                  <FileUp size={15} />
                )}
              </div>

              <div>
                <strong>
                  {protocol.label}
                </strong>

                <span>
                  {protocol.value}
                </span>
              </div>

              {protocol.active && (
                <ChevronRight
                  size={16}
                  className="protocol-arrow"
                />
              )}
            </div>
          ))}
        </div>
      </section>

      <footer>
        <div>
          <Info size={14} />

          PulmoScan AI is a decision-support
          tool, not a diagnostic device.
        </div>

        <span>
          DenseNet121 · Threshold 0.35
        </span>
      </footer>
    </main>
  )
}