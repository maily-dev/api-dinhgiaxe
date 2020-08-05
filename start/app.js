'use strict'
const path = require('path')
/*
|--------------------------------------------------------------------------
| Providers
|--------------------------------------------------------------------------
|
| Providers are building blocks for your Adonis app. Anytime you install
| a new Adonis specific package, chances are you will register the
| provider here.
|
*/
const providers = [
  '@adonisjs/framework/providers/AppProvider',
  '@adonisjs/framework/providers/ViewProvider',
  '@adonisjs/lucid/providers/LucidProvider',
  '@adonisjs/bodyparser/providers/BodyParserProvider',
  '@adonisjs/cors/providers/CorsProvider',
  '@adonisjs/session/providers/SessionProvider',
  '@adonisjs/auth/providers/AuthProvider',
  // 'adonis-acl/providers/AclProvider',
  '@adonisjs/validator/providers/ValidatorProvider',
  '@adonisjs/ally/providers/AllyProvider',
  '@adonisjs/mail/providers/MailProvider',
  '@adonisjs/drive/providers/DriveProvider',
  '@adonisjs/websocket/providers/WsProvider',
  'adonis-scheduler/providers/SchedulerProvider',
  path.join(__dirname, '..', 'plugins/adonis-acl/providers/AclProvider'),
  'adonis-lucid-filter/providers/LucidFilterProvider',
  '@radmen/adonis-lucid-soft-deletes/providers/SoftDeletesProvider'
]

/*
|--------------------------------------------------------------------------
| Ace Providers
|--------------------------------------------------------------------------
|
| Ace providers are required only when running ace commands. For example
| Providers for migrations, tests etc.
|
*/
const aceProviders = [
  '@adonisjs/lucid/providers/MigrationsProvider',
  // 'adonis-acl/providers/CommandsProvider',
  'adonis-scheduler/providers/CommandsProvider',
  path.join(__dirname, '..', 'plugins/adonis-acl/providers/CommandsProvider')
]

/*
|--------------------------------------------------------------------------
| Aliases
|--------------------------------------------------------------------------
|
| Aliases are short unique names for IoC container bindings. You are free
| to create your own aliases.
|
| For example:
|   { Route: 'Adonis/Src/Route' }
|
*/
const aliases = {
  Role: 'Adonis/Acl/Role',
  Permission: 'Adonis/Acl/Permission',
  Scheduler: 'Adonis/Addons/Scheduler'
}

/*
|--------------------------------------------------------------------------
| Commands
|--------------------------------------------------------------------------
|
| Here you store ace commands for your package
|
*/
const commands = []

module.exports = { providers, aceProviders, aliases, commands }
