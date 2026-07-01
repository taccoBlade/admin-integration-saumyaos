# Engineering Standards: Performance

- **3D Optimization**: Limit node counts in Three.js graphs. Skip rendering WebGL elements on screens below 768px.
- **Framer Motion Compositing**: Animate GPU-friendly properties (`opacity`, `transform`) instead of layout-breakers (`width`, `height`).
- **Render Control**: Prevent unnecessary React updates by wrapping static sections.
