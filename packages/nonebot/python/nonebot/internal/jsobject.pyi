from typing import Generic, TypeVar, Callable, Any

T = TypeVar("T")
V = TypeVar("V")
K = TypeVar("K")
S = TypeVar("S")


class PythonizeObject(Generic[T]):
    def __getattr__(self, item) -> JSProxyObject | Any:
        pass


class JSProxyObject(Generic[T]):
    def to_py(self) -> PythonizeObject[T] | T:  # real signature unknown
        ...

    def __getattr__(self, item) -> JSProxyObject[T]:  # real signature unknown
        ...


class JSProxyCallable(Callable, JSProxyObject):
    ...


JSObject = JSProxyObject[S] | S
