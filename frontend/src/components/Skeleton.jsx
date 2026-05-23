import React from 'react';

/**
 * SkeletonStyles
 * Injects the global pulsing shimmer keyframes into the page.
 */
export const SkeletonStyles = () => (
	<style>{`
		@keyframes pulse {
			0%, 100% {
				opacity: 1;
				background-color: #f1f5f9;
			}
			50% {
				opacity: .4;
				background-color: #e2e8f0;
			}
		}
		.skeleton-pulse {
			animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
		}
	`}</style>
);

/**
 * Skeleton Shape Component
 */
export const Skeleton = ({ width, height, borderRadius = '4px', className = '' }) => (
	<div
		className={`skeleton-pulse ${className}`}
		style={{
			width: width,
			height: height,
			borderRadius: borderRadius,
		}}
	/>
);
