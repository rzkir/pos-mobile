//================= PermissionContext ==================//
interface PermissionContextType {
  cameraPermission: boolean | null;
  allPermissionsGranted: boolean;
  requestPermissions: () => Promise<void>;
  checkPermissions: () => Promise<void>;
  loading: boolean;
}
