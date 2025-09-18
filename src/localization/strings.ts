﻿import { Language } from "./languages";

export const strings = {
    defaultRoomName: {
        [Language.EN]: "%username%'s room",
        [Language.RU]: "Комната %username%",
    },
    
    roomCreated: {
        [Language.EN]: "Room created\nOwner: <@%ownerId%>",
        [Language.RU]: "Комната создана\nВладелец: <@%ownerId%>",
    },
    
    changeOwner: {
        [Language.EN]: "Change owner",
        [Language.RU]: "Сменить владельца",
    },
    newOwnerId: {
        [Language.EN]: "New owner ID",
        [Language.RU]: "ID нового владельца",
    },
    roomOwnerChanged: {
        [Language.EN]: "Room owner changed to <@%newOwnerId%>",
        [Language.RU]: "Владелец комнаты изменён на <@%newOwnerId%>",
    },
    ownerNotFound: {
        [Language.EN]: "Owner not found",
        [Language.RU]: "Владелец не найден",
    },
    
    renameRoom: {
        [Language.EN]: "Rename room",
        [Language.RU]: "Переименовать комнату",
    },
    newRoomName: {
        [Language.EN]: "New room name",
        [Language.RU]: "Новое имя комнаты",
    },
    roomRenamed: {
        [Language.EN]: "Room renamed to %rename%",
        [Language.RU]: "Комната переименована в %rename%",
    },
    
    setLobbyVoiceChannel: {
        [Language.EN]: "Set lobby voice channel",
        [Language.RU]: "Установить голосовой канал лобби",
    },
    voiceChannel: {
        [Language.EN]: "Voice channel",
        [Language.RU]: "Голосовой канал",
    },
    lobbyVoiceChannelSet: {
        [Language.EN]: "Lobby voice channel set to <#%channelId%>",
        [Language.RU]: "Голосовой канал лобби установлен на <#%channelId%>",
    },
    
    setTempRoomCategory: {
        [Language.EN]: "Set category for temporary rooms",
        [Language.RU]: "Установить категорию для временных комнат",
    },
    category: {
        [Language.EN]: "Category",
        [Language.RU]: "Категория",
    },
    tempRoomCategorySet: {
        [Language.EN]: "Temporary room category set to <#%categoryId%>",
        [Language.RU]: "Категория временных комнат установлена на <#%categoryId%>",
    },
    
    status: {
        [Language.EN]: "Status",
        [Language.RU]: "Статус",
    },
    noGuildSettings: {
        [Language.EN]: "No guild settings",
        [Language.RU]: "Нет настроек гильдии",
    },
    statusMessage: {
        [Language.EN]: "Status:\n\nLobby voice channel: <#%lobbyVoiceId%>\nTemporary room category: <#%roomCategoryId%>\nLanguage: %language%",
        [Language.RU]: "Статус:\n\nГолосовой канал лобби: <#%lobbyVoiceId%>\nКатегория временных комнат: <#%roomCategoryId%>\nЯзык: %language%",
    },

    setLanguage: {
        [Language.EN]: "Set language",
        [Language.RU]: "Установить язык",
    },
    language: {
        [Language.EN]: "Language",
        [Language.RU]: "Язык",
    },
    onLanguageChanged: {
        [Language.EN]: "Language changed to %language%",
        [Language.RU]: "Язык изменён на %language%",
    },
    fetchAllUsers: {
        [Language.EN]: "Fetch all users data",
        [Language.RU]: "Обновить данные всех пользователей",
    }
} as const;
