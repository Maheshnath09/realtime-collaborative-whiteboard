import React, { useState, useRef, useEffect } from 'react';

interface TextElementProps {
    id: string;
    x: number;
    y: number;
    text: string;
    color: string;
    fontSize?: number;
    onUpdate: (id: string, text: string) => void;
    onComplete: () => void;
    zoom?: number;
    panX?: number;
    panY?: number;
    containerRef?: React.RefObject<HTMLDivElement>;
}

const TextElement: React.FC<TextElementProps> = ({
    id,
    x,
    y,
    text,
    color,
    fontSize = 16,
    onUpdate,
    onComplete,
    zoom = 100,
    panX = 0,
    panY = 0,
    containerRef,
}) => {
    const [isEditing, setIsEditing] = useState(!text);
    const [value, setValue] = useState(text);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            // Delay focus slightly to ensure component is mounted
            setTimeout(() => {
                if (inputRef.current) {
                    inputRef.current.focus();
                }
            }, 50);
        }
    }, [isEditing]);

    const handleBlur = () => {
        if (value.trim()) {
            onUpdate(id, value);
            setIsEditing(false);
        }
        onComplete();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            handleBlur();
        }
        // Prevent canvas from capturing these key events
        e.stopPropagation();
    };

    // Calculate position based on zoom and pan
    const zoomScale = zoom / 100;
    const calculatedX = x * zoomScale + panX;
    const calculatedY = y * zoomScale + panY;
    const calculatedFontSize = Math.max(12, fontSize * zoomScale);

    if (isEditing) {
        return (
            <textarea
                ref={inputRef}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                autoFocus
                style={{
                    position: 'absolute',
                    left: `${calculatedX}px`,
                    top: `${calculatedY}px`,
                    color: '#111827',
                    fontSize: `${calculatedFontSize}px`,
                    border: '2px solid #2563EB',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    background: '#ffffff',
                    fontFamily: 'Inter, sans-serif',
                    resize: 'both',
                    minWidth: '250px',
                    minHeight: '50px',
                    zIndex: 9999,
                    boxShadow: '0 8px 25px rgba(37,99,235,0.25)',
                    outline: 'none',
                }}
                placeholder="Type here..."
            />
        );
    }

    return (
        <div
            onClick={() => setIsEditing(true)}
            style={{
                position: 'absolute',
                left: `${calculatedX}px`,
                top: `${calculatedY}px`,
                color,
                fontSize: `${calculatedFontSize}px`,
                fontFamily: 'Inter, sans-serif',
                cursor: 'text',
                padding: '4px 8px',
                whiteSpace: 'pre-wrap',
                zIndex: 500,
            }}
        >
            {value}
        </div>
    );
};

export default TextElement;
