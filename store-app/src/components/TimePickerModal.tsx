import { useState, useEffect, useRef, useCallback } from 'react'
import styles from './TimePickerModal.module.css'

const HOURS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'))
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'))
const AMPM = ['AM', 'PM'] as const

interface Props {
  value: string
  onChange: (value: string) => void
  onClose: () => void
}

function ScrollColumn({
  items,
  value,
  onChange,
  unit,
}: {
  items: string[]
  value: string
  onChange: (v: string) => void
  unit: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const idx = items.indexOf(value)
  const itemH = 44

  useEffect(() => {
    if (ref.current) {
      ref.current.scrollTo({ top: idx * itemH, behavior: 'auto' })
    }
  }, [idx])

  const handleScroll = useCallback(() => {
    if (!ref.current) return
    const scrollTop = ref.current.scrollTop
    const newIdx = Math.round(scrollTop / itemH)
    const clamped = Math.max(0, Math.min(items.length - 1, newIdx))
    if (items[clamped] !== value) {
      onChange(items[clamped])
    }
  }, [items, value, onChange])

  return (
    <div className={styles.column}>
      {unit && <span className={styles.columnLabel}>{unit}</span>}
      <div ref={ref} className={styles.scrollArea} onScroll={handleScroll}>
        <div className={styles.spacer} />
        {items.map((item) => (
          <div key={item} className={`${styles.item} ${item === value ? styles.itemActive : ''}`}>
            {item}
          </div>
        ))}
        <div className={styles.spacer} />
      </div>
    </div>
  )
}

export default function TimePickerModal({ value, onChange, onClose }: Props) {
  let h = 1
  let m = '00'
  let p: 'AM' | 'PM' = 'PM'

  if (value) {
    const [hStr, mStr] = value.split(':')
    const hn = Number(hStr)
    if (hn === 0) {
      h = 12
      p = 'AM'
    } else if (hn < 12) {
      h = hn
      p = 'AM'
    } else if (hn === 12) {
      h = 12
      p = 'PM'
    } else {
      h = hn - 12
      p = 'PM'
    }
    m = mStr
  }

  const [selH, setSelH] = useState(String(h).padStart(2, '0'))
  const [selM, setSelM] = useState(m)
  const [selP, setSelP] = useState<'AM' | 'PM'>(p)

  const handleApply = () => {
    let hr = Number(selH)
    if (selP === 'PM' && hr < 12) hr += 12
    if (selP === 'AM' && hr === 12) hr = 0
    const formatted = `${String(hr).padStart(2, '0')}:${selM}`
    onChange(formatted)
    onClose()
  }

  const handleCancel = () => {
    onClose()
  }

  return (
    <div className={styles.overlay} onClick={handleCancel}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <button className={styles.cancelBtn} onClick={handleCancel}>Cancel</button>
          <span className={styles.title}>Select Time</span>
          <button className={styles.applyBtn} onClick={handleApply}>Apply</button>
        </div>
        <div className={styles.pickerContainer}>
          <div className={styles.highlight} />
          <div className={styles.picker}>
            <ScrollColumn items={HOURS} value={selH} onChange={setSelH} unit="Hour" />
            <div className={styles.separator}>:</div>
            <ScrollColumn items={MINUTES} value={selM} onChange={setSelM} unit="Min" />
            <ScrollColumn items={AMPM as unknown as string[]} value={selP} onChange={(v) => setSelP(v as 'AM' | 'PM')} unit="" />
          </div>
        </div>
      </div>
    </div>
  )
}
