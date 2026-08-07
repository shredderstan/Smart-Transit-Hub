import React from 'react';
import { User } from 'lucide-react';

export default function StudentInfoCard({ student, busLocation }) {
  if (!student) return null;

  return (
    <div className="card student-card">
      <div className="student-header">
        <div className="student-avatar">
          <User size={20} />
        </div>
        <div>
          <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)' }}>
            {student.firstName} {student.lastName}
          </h4>
          <span className="badge badge-yellow" style={{ fontSize: '0.6875rem' }}>
            Roll: {student.rollNumber}
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div className="student-detail-row">
          <span style={{ color: 'var(--text-muted)' }}>Assigned Stop:</span>
          <strong style={{ color: 'var(--text-main)' }}>{student.stopName || 'Unassigned'}</strong>
        </div>
        <div className="student-detail-row">
          <span style={{ color: 'var(--text-muted)' }}>Assigned Route:</span>
          <strong style={{ color: 'var(--text-main)' }}>{student.routeName || 'System Route'}</strong>
        </div>
        {busLocation && busLocation.nextStopName && (
          <div className="student-detail-row">
            <span style={{ color: 'var(--text-muted)' }}>Next Bus Stop:</span>
            <span style={{ fontWeight: 700, color: 'var(--yellow-hover)' }}>{busLocation.nextStopName}</span>
          </div>
        )}
      </div>
    </div>
  );
}
