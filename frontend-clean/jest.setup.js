import '@testing-library/jest-dom';
import { mockPush } from './test-utils/routerMock';

jest.mock('next/navigation', () => ({
	useRouter: () => ({
		push: mockPush,
	}),
}));