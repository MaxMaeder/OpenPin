package org.openpin.primaryapp.gestureinterpreter

enum class GestureAction {
    PHOTO,           // One-shot: double tap.
    VIDEO,           // One-shot: tap+hold with two fingers.
    TRANSLATE,       // Transactional: long press (without tap) with two fingers.
    ASSISTANT,       // Transactional: long press (without tap) with one finger.
    ASSISTANT_VISION // Transactional: tap+hold with one finger.
}
