import { getCurrentUser } from './auth';

export async function getSession() {
    const user = await getCurrentUser();
    return { user };
}
