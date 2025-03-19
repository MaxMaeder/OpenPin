package org.openpin.appframework.utils

/**
 * Allows modifying immutable data classes by applying a transformation.
 */
fun <T> T.update(transform: T.() -> T): T = this.transform()