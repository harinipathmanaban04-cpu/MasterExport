import React from 'react';

export default function Empty({ text = 'No records found' }) {
	return <div className="empty">{text}</div>;
}
