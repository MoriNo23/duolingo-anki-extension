export const checkUrl = (params: string) => {
    const lastUrl: string = location.href
    return lastUrl.includes(params)
}
