import React from 'react';
import { generateEmbedCode } from '../utils/generateScript';

export default function ConfigPanel({ config, setConfig, onExportImage, onRecordVideo, onResetModel }) {
    const [isCustomColor, setIsCustomColor] = React.useState(false);
    const [isDragging, setIsDragging] = React.useState(false);
    const fileInputRef = React.useRef(null);

    const PRESET_COLORS = [
        { name: 'Space Black', value: '#343434' },
        { name: 'Silver', value: '#e2e4e1' },
        { name: 'Gold', value: '#fae7cf' },
        { name: 'Deep Purple', value: '#594f63' },
        { name: 'Sierra Blue', value: '#9BB5CE' },
    ];

    const handleChange = (key, value) => {
        setConfig(prev => ({ ...prev, [key]: value }));
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const url = URL.createObjectURL(file);
            handleChange('textureUrl', url);
        }
    };

    const generateCode = async () => {
        let finalConfig = { ...config };

        // Convert blob URL to base64 if present
        if (config.textureUrl && config.textureUrl.startsWith('blob:')) {
            try {
                const response = await fetch(config.textureUrl);
                const blob = await response.blob();
                const base64 = await new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result);
                    reader.readAsDataURL(blob);
                });
                finalConfig.textureUrl = base64;
            } catch (e) {
                console.error('Failed to convert image to base64', e);
                // Fallback to original behavior (placeholder will be used)
            }
        }

        const code = generateEmbedCode(finalConfig);
        navigator.clipboard.writeText(code);
        alert('Vanilla Three.js Standalone Code copied to clipboard! Image has been embedded.');
    };

    return (
        <div style={{
            position: 'absolute',
            width: '340px',
            height: '100vh',
            padding: '24px 20px',
            boxSizing: 'border-box',
            overflowY: 'auto',
            background: '#ffffff',
            borderRight: '1px solid #e5e7eb',
            zIndex: 10,
            fontFamily: 'system-ui, sans-serif'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <img src="/logo.svg" alt="Logo" style={{ width: 48, height: 48 }} />
                <h2 style={{ margin: 0, fontSize: '1.4em', fontWeight: 600, color: '#1a1a1a' }}>MakeMock</h2>
            </div>

            <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Screen Image</label>

                <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
                    onDrop={(e) => {
                        e.preventDefault();
                        setIsDragging(false);
                        const file = e.dataTransfer.files[0];
                        if (file) {
                            const url = URL.createObjectURL(file);
                            handleChange('textureUrl', url);
                        }
                    }}
                    style={{
                        border: '2px dashed #ccc',
                        borderRadius: 12,
                        padding: '32px 20px',
                        textAlign: 'center',
                        backgroundColor: isDragging ? '#f0f9ff' : '#fff',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 12,
                        cursor: 'default'
                    }}
                >
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M7 10V9C7 6.23858 9.23858 4 12 4C14.7614 4 17 6.23858 17 9V10C19.2091 10 21 11.7909 21 14C21 16.2091 19.2091 18 17 18H7C4.79086 18 3 16.2091 3 14C3 11.7909 4.79086 10 7 10Z" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M12 15V12M12 12L10 14M12 12L14 14" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>

                    <div style={{ color: '#9CA3AF', fontSize: '1.1em', fontWeight: 500 }}>
                        Drag&Drop files here
                    </div>

                    <div style={{ color: '#9CA3AF', fontSize: '0.9em' }}>
                        or
                    </div>

                    <button
                        onClick={() => fileInputRef.current.click()}
                        style={{
                            padding: '8px 24px',
                            background: 'white',
                            color: '#00BFFF',
                            border: '2px solid #00BFFF',
                            borderRadius: 6,
                            fontWeight: 600,
                            cursor: 'pointer',
                            fontSize: '1em',
                            transition: 'all 0.2s'
                        }}
                    >
                        Browse Files
                    </button>

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        style={{ display: 'none' }}
                    />
                </div>
            </div>

            <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Chassis Color</label>

                <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
                    <button
                        onClick={() => setIsCustomColor(false)}
                        style={{
                            flex: 1,
                            padding: '6px 12px',
                            background: !isCustomColor ? '#007AFF' : '#f0f0f0',
                            color: !isCustomColor ? 'white' : '#333',
                            border: 'none',
                            borderRadius: 6,
                            cursor: 'pointer',
                            fontSize: '0.9em'
                        }}
                    >
                        Presets
                    </button>
                    <button
                        onClick={() => setIsCustomColor(true)}
                        style={{
                            flex: 1,
                            padding: '6px 12px',
                            background: isCustomColor ? '#007AFF' : '#f0f0f0',
                            color: isCustomColor ? 'white' : '#333',
                            border: 'none',
                            borderRadius: 6,
                            cursor: 'pointer',
                            fontSize: '0.9em'
                        }}
                    >
                        Custom
                    </button>
                </div>

                {!isCustomColor ? (
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between' }}>
                        {PRESET_COLORS.map((preset) => (
                            <div
                                key={preset.name}
                                onClick={() => handleChange('color', preset.value)}
                                title={preset.name}
                                style={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: '50%',
                                    background: preset.value,
                                    cursor: 'pointer',
                                    border: config.color === preset.value ? '2px solid #007AFF' : '1px solid #ddd',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                    transform: config.color === preset.value ? 'scale(1.1)' : 'scale(1)',
                                    transition: 'transform 0.2s'
                                }}
                            />
                        ))}
                    </div>
                ) : (
                    <input
                        type="color"
                        value={config.color}
                        onChange={(e) => handleChange('color', e.target.value)}
                        style={{ width: '100%', height: 40, cursor: 'pointer' }}
                    />
                )}
            </div>

            <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Movement</label>
                <div style={{ display: 'flex', gap: 8 }}>
                    {['static', 'autoRotate', 'bounceWiggle', 'parallax'].map((type) => (
                        <button
                            key={type}
                            onClick={() => handleChange('movementType', type)}
                            style={{
                                flex: 1,
                                padding: '6px 4px',
                                background: config.movementType === type ? '#007AFF' : '#f0f0f0',
                                color: config.movementType === type ? 'white' : '#333',
                                border: 'none',
                                borderRadius: 6,
                                cursor: 'pointer',
                                fontSize: '0.8em',
                                textTransform: 'capitalize'
                            }}
                        >
                            {type === 'bounceWiggle' ? 'Bounce' : type.replace(/([A-Z])/g, ' $1').trim()}
                        </button>
                    ))}
                </div>
            </div>

            {
                config.movementType === 'autoRotate' && (
                    <div style={{ marginBottom: 16, paddingLeft: 8, borderLeft: '2px solid #eee' }}>
                        <label style={{ display: 'block', marginBottom: 4, fontSize: '0.85em', color: '#666' }}>Rotation Speed</label>
                        <input
                            type="range"
                            min="0.1"
                            max="5.0"
                            step="0.1"
                            value={config.rotationSpeed}
                            onChange={(e) => handleChange('rotationSpeed', parseFloat(e.target.value))}
                            style={{ width: '100%', cursor: 'pointer' }}
                        />
                    </div>
                )
            }

            {
                config.movementType === 'bounceWiggle' && (
                    <div style={{ marginBottom: 16, paddingLeft: 8, borderLeft: '2px solid #eee' }}>
                        <div style={{ marginBottom: 12 }}>
                            <label style={{ display: 'block', marginBottom: 4, fontSize: '0.85em', color: '#666' }}>Bounce Speed</label>
                            <input
                                type="range"
                                min="0.1"
                                max="5.0"
                                step="0.1"
                                value={config.bounceSpeed}
                                onChange={(e) => handleChange('bounceSpeed', parseFloat(e.target.value))}
                                style={{ width: '100%', cursor: 'pointer' }}
                            />
                        </div>
                        <div style={{ marginBottom: 12 }}>
                            <label style={{ display: 'block', marginBottom: 4, fontSize: '0.85em', color: '#666' }}>Bounce Height</label>
                            <input
                                type="range"
                                min="0.0"
                                max="5.0"
                                step="0.1"
                                value={config.bounceHeight}
                                onChange={(e) => handleChange('bounceHeight', parseFloat(e.target.value))}
                                style={{ width: '100%', cursor: 'pointer' }}
                            />
                        </div>
                        <div style={{ marginBottom: 12 }}>
                            <label style={{ display: 'block', marginBottom: 4, fontSize: '0.85em', color: '#666' }}>Wiggle Speed</label>
                            <input
                                type="range"
                                min="0.1"
                                max="5.0"
                                step="0.1"
                                value={config.wiggleSpeed}
                                onChange={(e) => handleChange('wiggleSpeed', parseFloat(e.target.value))}
                                style={{ width: '100%', cursor: 'pointer' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: 4, fontSize: '0.85em', color: '#666' }}>Wiggle Intensity</label>
                            <input
                                type="range"
                                min="0.0"
                                max="3.0"
                                step="0.1"
                                value={config.wiggleIntensity}
                                onChange={(e) => handleChange('wiggleIntensity', parseFloat(e.target.value))}
                                style={{ width: '100%', cursor: 'pointer' }}
                            />
                        </div>
                    </div>
                )
            }

            <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Model Control</label>
                <div style={{ marginBottom: 12 }}>
                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: '0.9em', marginBottom: 8 }}>
                        <input
                            type="checkbox"
                            checked={config.userInteraction}
                            onChange={(e) => handleChange('userInteraction', e.target.checked)}
                            style={{ marginRight: 8 }}
                        />
                        Allow Interaction
                    </label>
                    {config.userInteraction && (
                        <>
                            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: '0.9em', marginBottom: 8 }}>
                                <input
                                    type="checkbox"
                                    checked={!!config.defaultModelOrientation}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            // Capture current orientation as default
                                            handleChange('shouldCaptureDefault', Date.now());
                                        } else {
                                            // Clear the custom default
                                            handleChange('defaultModelOrientation', null);
                                        }
                                    }}
                                    style={{ marginRight: 8 }}
                                />
                                Use current view as default
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: '0.9em' }}>
                                <input
                                    type="checkbox"
                                    checked={config.autoSnapBack || false}
                                    onChange={(e) => handleChange('autoSnapBack', e.target.checked)}
                                />
                                Snap back to default
                            </label>
                        </>
                    )}
                </div>
                <button
                    onClick={onResetModel}
                    style={{
                        width: '100%',
                        marginTop: 12,
                        padding: '8px 12px',
                        background: '#f0f0f0',
                        color: '#333',
                        border: '1px solid #ddd',
                        borderRadius: 6,
                        cursor: 'pointer',
                        fontSize: '0.9em',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6
                    }}
                >
                    🔄 Reset Orientation
                </button>
            </div>

            <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Background</label>

                <div style={{ display: 'flex', gap: 4, marginBottom: 16, background: '#f0f0f0', padding: 2, borderRadius: 8 }}>
                    {['transparent', 'solid', 'gradient'].map((type) => (
                        <button
                            key={type}
                            onClick={() => handleChange('backgroundType', type)}
                            style={{
                                flex: 1,
                                padding: '6px 4px',
                                background: config.backgroundType === type ? '#fff' : 'transparent',
                                color: config.backgroundType === type ? '#000' : '#666',
                                border: config.backgroundType === type ? '1px solid rgba(0,0,0,0.1)' : 'none',
                                borderRadius: 6,
                                cursor: 'pointer',
                                fontSize: '0.85em',
                                textTransform: 'capitalize',
                                boxShadow: config.backgroundType === type ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                                transition: 'all 0.2s',
                                fontWeight: config.backgroundType === type ? 500 : 400
                            }}
                        >
                            {type}
                        </button>
                    ))}
                </div>

                {config.backgroundType === 'solid' && (
                    <div style={{ marginBottom: 12 }}>
                        <label style={{ display: 'block', marginBottom: 4, fontSize: '0.85em', color: '#666' }}>Color</label>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            <input
                                type="color"
                                value={config.backgroundColor || '#e5e7eb'}
                                onChange={(e) => handleChange('backgroundColor', e.target.value)}
                                style={{ width: 40, height: 40, cursor: 'pointer', border: '1px solid #ddd', borderRadius: 6, padding: 0 }}
                            />
                            <div style={{ flex: 1, background: '#f9f9f9', padding: '8px 12px', borderRadius: 6, fontSize: '0.9em', color: '#333', border: '1px solid #eee' }}>
                                {config.backgroundColor || '#e5e7eb'}
                            </div>
                        </div>
                    </div>
                )}

                {config.backgroundType === 'gradient' && (
                    <div style={{ paddingLeft: 8, borderLeft: '2px solid #eee' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: 4, fontSize: '0.8 em', color: '#666' }}>Start</label>
                                <input
                                    type="color"
                                    value={config.backgroundGradientStart || '#ffffff'}
                                    onChange={(e) => handleChange('backgroundGradientStart', e.target.value)}
                                    style={{ width: '100%', height: 36, cursor: 'pointer', border: '1px solid #ddd', borderRadius: 6, padding: 0 }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: 4, fontSize: '0.8em', color: '#666' }}>End</label>
                                <input
                                    type="color"
                                    value={config.backgroundGradientEnd || '#e5e7eb'}
                                    onChange={(e) => handleChange('backgroundGradientEnd', e.target.value)}
                                    style={{ width: '100%', height: 36, cursor: 'pointer', border: '1px solid #ddd', borderRadius: 6, padding: 0 }}
                                />
                            </div>
                        </div>

                        <div style={{ marginBottom: 16 }}>
                            <label style={{ display: 'block', marginBottom: 4, fontSize: '0.85em', color: '#666' }}>Angle: {config.backgroundGradientAngle || 45}°</label>
                            <input
                                type="range"
                                min="0"
                                max="360"
                                value={config.backgroundGradientAngle || 45}
                                onChange={(e) => handleChange('backgroundGradientAngle', parseInt(e.target.value))}
                                style={{ width: '100%', cursor: 'pointer' }}
                            />
                        </div>

                        <div style={{ marginBottom: 8 }}>
                            <label style={{ display: 'block', marginBottom: 6, fontSize: '0.85em', color: '#666' }}>Presets</label>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                                {[
                                    { s: '#ff9a9e', e: '#fecfef', a: 0, n: 'Sweet' },
                                    { s: '#a18cd1', e: '#fbc2eb', a: 120, n: 'Lavender' },
                                    { s: '#84fab0', e: '#8fd3f4', a: 120, n: 'Ocean' },
                                    { s: '#fa709a', e: '#fee140', a: 45, n: 'Sunset' },
                                    { s: '#2193b0', e: '#6dd5ed', a: 135, n: 'Cool' },
                                    { s: '#2b5876', e: '#4e4376', a: 160, n: 'Deep' },
                                    { s: '#eb3349', e: '#f45c43', a: 90, n: 'Cherry' },
                                    { s: '#09203f', e: '#537895', a: 135, n: 'Midnight' }
                                ].map((p, i) => (
                                    <div
                                        key={i}
                                        onClick={() => {
                                            handleChange('backgroundGradientStart', p.s);
                                            handleChange('backgroundGradientEnd', p.e);
                                            handleChange('backgroundGradientAngle', p.a);
                                        }}
                                        title={p.n}
                                        style={{
                                            aspectRatio: '1',
                                            borderRadius: 6,
                                            background: `linear-gradient(${p.a}deg, ${p.s}, ${p.e})`,
                                            cursor: 'pointer',
                                            border: '1px solid rgba(0,0,0,0.1)',
                                            boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div style={{ marginBottom: 24, borderTop: '1px solid #eee', paddingTop: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Rendering & Effects</label>

                <div style={{ marginBottom: 12 }}>
                    <label style={{ display: 'block', marginBottom: 4, fontSize: '0.85em', color: '#666' }}>Lighting</label>
                    <select
                        value={config.lightingPreset}
                        onChange={(e) => handleChange('lightingPreset', e.target.value)}
                        style={{ width: '100%', padding: '6px', borderRadius: 6, border: '1px solid #ddd', cursor: 'pointer' }}
                    >
                        <option value="city">Studio (City)</option>
                        <option value="warehouse">Industrial</option>
                        <option value="sunset">Sunset</option>
                        <option value="park">Natural (Park)</option>
                        <option value="night">Night</option>
                    </select>
                </div>

                <div style={{ marginBottom: 12 }}>
                    <label style={{ display: 'block', marginBottom: 4, fontSize: '0.85em', color: '#666' }}>Screen Roughness (Reflection)</label>
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={config.screenRoughness !== undefined ? config.screenRoughness : 0.2}
                        onChange={(e) => handleChange('screenRoughness', parseFloat(e.target.value))}
                        style={{ width: '100%', cursor: 'pointer' }}
                    />
                </div>

                <div style={{ marginBottom: 12 }}>
                    <label style={{ display: 'block', marginBottom: 4, fontSize: '0.85em', color: '#666' }}>Screen Brightness (Emissive)</label>
                    <input
                        type="range"
                        min="0"
                        max="2"
                        step="0.05"
                        value={config.screenEmissive !== undefined ? config.screenEmissive : 0.0}
                        onChange={(e) => handleChange('screenEmissive', parseFloat(e.target.value))}
                        style={{ width: '100%', cursor: 'pointer' }}
                    />
                </div>


            </div>

            <div style={{ marginBottom: 24, borderTop: '1px solid #eee', paddingTop: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Export & Output</label>

                <div style={{ marginBottom: 12 }}>
                    <label style={{ display: 'block', marginBottom: 4, fontSize: '0.85em', color: '#666' }}>Aspect Ratio</label>
                    <select
                        value={config.aspectRatio}
                        onChange={(e) => handleChange('aspectRatio', e.target.value)}
                        style={{
                            width: '100%',
                            padding: '6px',
                            borderRadius: 6,
                            border: '1px solid #ddd',
                            backgroundColor: '#f9f9f9',
                            cursor: 'pointer'
                        }}
                    >
                        <option value="native">Native (Window)</option>
                        <option value="9:16">9:16 (Stories)</option>
                        <option value="16:9">16:9 (Video)</option>
                        <option value="4:3">4:3 (Post)</option>
                        <option value="1:1">1:1 (Square)</option>
                    </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <button
                        onClick={onExportImage}
                        style={{
                            padding: '8px',
                            background: '#333',
                            color: 'white',
                            border: 'none',
                            borderRadius: 6,
                            cursor: 'pointer',
                            fontSize: '0.9em',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 4
                        }}
                    >
                        📸 4K PNG
                    </button>
                    <button
                        onClick={() => onRecordVideo?.(5000)}
                        style={{
                            padding: '8px',
                            background: '#ff3b30',
                            color: 'white',
                            border: 'none',
                            borderRadius: 6,
                            cursor: 'pointer',
                            fontSize: '0.9em',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 4
                        }}
                    >
                        🎥 Rec 5s
                    </button>
                </div>
            </div>

            <button
                onClick={generateCode}
                style={{
                    width: '100%',
                    padding: '12px',
                    background: '#007AFF',
                    color: 'white',
                    border: 'none',
                    borderRadius: 8,
                    fontWeight: 600,
                    cursor: 'pointer'
                }}
            >
                Generate JS
            </button>
        </div >
    );
}
