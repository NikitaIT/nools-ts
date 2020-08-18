---
id: README
title: README
---

# nools-ts
[nools](https://github.com/C2FO/nools) in TypeScript.

# Nools

[![Join the chat at https://gitter.im/C2FO/nools](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/C2FO/nools?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

Nools is a [rete](http://en.wikipedia.org/wiki/Rete_algorithm) based rules engine written entirely in javascript.



# Usage

   * Flows
    * [Defining A Flow](#flow)
    * [Sessions](#session)
    * [Facts](#facts)
        * [Assert](#facts-assert)
        * [Retract](#facts-retract)
        * [Modify](#facts-modify)
        * [Retrieving Facts](#get-facts)
    * [Firing](#firing)
    * [Disposing](#disposing)
    * [Removing A Flow](#removing-flow)
    * [Removing All Flows](#removing-flows)
    * [Checking If A Flow Exists](#checking-for-flow)
    * [Agenda Group](#agenda-groups)
      * [Focus](#agenda-groups-focus)
      * [Auto Focus](#agenda-groups-auto-focus)
    * [Conflict Resolution](#conflict-resolution)
   * [Defining Rules](#defining-rule)
      * [Structure](#rule-structure)
      * [Salience](#rule-salience)
      * [Scope](#rule-scope)
      * [Constraints](#constraints)
        * [Custom](#custom-contraints)
        * [Not](#not-constraint)
        * [Or](#or-constraint)
        * [From](#from-constraint)
        * [Exists](#exists-constraint)
      * [Actions](#action)
        * [Async Actions](#action-async)
      * [Globals](#globals)
      * [Import](#import)
   * [Browser Support](#browser-support)
   * [Fibonacci](#fib)











