/**
 * Single tuning point for “speaking” vs “listening / still” UI and agent state.
 * Hysteresis: release is half this value so level can dip without toggling every frame.
 */
export const SPEAKING_THRESHOLD = 0.038;

export const SPEAKING_LEVEL_RELEASE = SPEAKING_THRESHOLD * 0.5;
