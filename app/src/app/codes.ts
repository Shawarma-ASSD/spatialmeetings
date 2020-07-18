/**
 * ErrorCode
 * Error codes for the Home page.
 */
export enum ErrorCode {
    RoomNotFound,
    RoomAlreadyExists
};

/**
 * ErrorMessage
 * Error messages for each error code in the home page.
 */
export const ErrorMessage = {
    RoomNotFound: 'La sala no existe.',
    RoomAlreadyExists: 'La sala ya existe.'
};