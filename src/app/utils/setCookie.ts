import { Response } from "express"

interface AuthTokens {
    accessToken?: string,
    refreshToken?: string
}

export const setCookie = ( res: Response, tokenInfo: AuthTokens) => {
    if(tokenInfo.accessToken){
        res.cookie("accessToken", tokenInfo.accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: "none" 
        })
    }
    if(tokenInfo.refreshToken){
        res.cookie("refreshToken", tokenInfo.refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "none" 
        })
    }
    
}