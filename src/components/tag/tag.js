import React from 'react'

import './tag.css'

export default function Tag({ className, children, ...props }) {
  const clsName = 'c-tag ' + (className ?? '');
  
  return (
    <div className={clsName} { ...props }>
      #{children}
    </div>
  )
}
