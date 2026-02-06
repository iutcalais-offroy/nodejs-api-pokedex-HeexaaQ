import {Request} from 'express';

export interface SignUpRequestBody { 
        email: string;
        username: string;
        password: string;
    };

export interface SignInRequestBody {
        email: string;
        password: string;
    };

export type SignUpRequest = Request<{}, any, SignUpRequestBody>;

export type SignInRequest = Request<{}, any, SignInRequestBody>;